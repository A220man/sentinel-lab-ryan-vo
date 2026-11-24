from typing import Optional
from jose import jwt, JWTError
from fastapi import Request, HTTPException, Depends
from fastapi.security import OAuth2AuthorizationCodeBearer
from pydantic import BaseModel
from app.core.config import settings


class KeycloakUser(BaseModel):
    sub: str  # Keycloak user ID
    email: Optional[str] = None
    preferred_username: Optional[str] = None
    name: Optional[str] = None


# OAuth2 scheme configured for Keycloak
# Token URL and authorization URL are set from deployment settings via env vars
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    tokenUrl=settings.oidc_redirect_uri or "/token",
    authorizationUrl=settings.oidc_issuer_url + "/protocol/openid-connect/auth" if settings.oidc_issuer_url else "/auth/keycloak/authorize",
    scopes={"openid": "OpenID", "profile": "User Profile"},
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> KeycloakUser:
    """Validate Keycloak JWT and return user payload.

    Decodes without signature verification for development.
    Production should verify against Keycloak JWKS endpoint.
    """
    try:
        payload = jwt.decode(
            token,
            options={"verify_signature": False},
            algorithms=["RS256"],
        )
        return KeycloakUser(
            sub=str(payload["sub"]),
            email=payload.get("email"),
            preferred_username=payload.get("preferred_username"),
            name=payload.get("name"),
        )
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {e}",
        )
