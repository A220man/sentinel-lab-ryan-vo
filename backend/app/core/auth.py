from typing import Optional
from jose import jwt, JWTError
from fastapi import Request, HTTPException, Depends
from fastapi.security import OAuth2AuthorizationCodeBearer
from pydantic import BaseModel


class KeycloakUser(BaseModel):
    sub: str  # Keycloak user ID
    email: Optional[str] = None
    preferred_username: Optional[str] = None
    name: Optional[str] = None


# OAuth2 scheme configured for Keycloak
# Token URL and authorization URL will be set per deployment
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    tokenUrl="",  # Override per deployment
    authorizationUrl="",  # Override per deployment
    scopes={},
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
