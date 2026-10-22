export interface Course {
  id: number;
  title: string;
  description: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail_url: string | null;
  author: string | null;
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  modules_count: number;
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  lessons_count: number;
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  description: string | null;
  lesson_type: 'notebook' | 'video' | 'article' | 'exercise';
  content_url: string | null;
  content_markdown: string | null;
  notebook_path: string | null;
  order: number;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Roadmap {
  id: number;
  title: string;
  description: string | null;
  target_audience: string | null;
  estimated_hours: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  steps: RoadmapStep[];
}

export interface RoadmapStep {
  id: number;
  roadmap_id: number;
  course_id: number | null;
  title: string;
  description: string | null;
  order: number;
  is_required: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
}