import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { Course, Module, Lesson, Roadmap, RoadmapStep, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Courses
  async getCourses(params?: {
    page?: number;
    page_size?: number;
    level?: string;
    published_only?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<Course>> {
    const response = await this.client.get('/courses', { params });
    return response.data;
  }

  async getCourse(id: number): Promise<Course> {
    const response = await this.client.get(`/courses/${id}`);
    return response.data;
  }

  async createCourse(course: Partial<Course>): Promise<Course> {
    const response = await this.client.post('/courses', course);
    return response.data;
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course> {
    const response = await this.client.put(`/courses/${id}`, course);
    return response.data;
  }

  async deleteCourse(id: number): Promise<void> {
    await this.client.delete(`/courses/${id}`);
  }

  // Modules
  async getModules(courseId: number): Promise<Module[]> {
    const response = await this.client.get(`/courses/${courseId}/modules`);
    return response.data;
  }

  async getModule(id: number): Promise<Module> {
    const response = await this.client.get(`/modules/${id}`);
    return response.data;
  }

  async createModule(courseId: number, module: Partial<Module>): Promise<Module> {
    const response = await this.client.post(`/courses/${courseId}/modules`, module);
    return response.data;
  }

  async updateModule(id: number, module: Partial<Module>): Promise<Module> {
    const response = await this.client.put(`/modules/${id}`, module);
    return response.data;
  }

  async deleteModule(id: number): Promise<void> {
    await this.client.delete(`/modules/${id}`);
  }

  // Lessons
  async getLessons(moduleId: number): Promise<Lesson[]> {
    const response = await this.client.get(`/modules/${moduleId}/lessons`);
    return response.data;
  }

  async getLesson(id: number): Promise<Lesson> {
    const response = await this.client.get(`/lessons/${id}`);
    return response.data;
  }

  async createLesson(moduleId: number, lesson: Partial<Lesson>): Promise<Lesson> {
    const response = await this.client.post(`/modules/${moduleId}/lessons`, lesson);
    return response.data;
  }

  async updateLesson(id: number, lesson: Partial<Lesson>): Promise<Lesson> {
    const response = await this.client.put(`/lessons/${id}`, lesson);
    return response.data;
  }

  async deleteLesson(id: number): Promise<void> {
    await this.client.delete(`/lessons/${id}`);
  }

  // Roadmaps
  async getRoadmaps(publishedOnly = true): Promise<Roadmap[]> {
    const response = await this.client.get('/roadmaps', { params: { published_only: publishedOnly } });
    return response.data;
  }

  async getRoadmap(id: number): Promise<Roadmap> {
    const response = await this.client.get(`/roadmaps/${id}`);
    return response.data;
  }

  async createRoadmap(roadmap: Partial<Roadmap>): Promise<Roadmap> {
    const response = await this.client.post('/roadmaps', roadmap);
    return response.data;
  }

  async updateRoadmap(id: number, roadmap: Partial<Roadmap>): Promise<Roadmap> {
    const response = await this.client.put(`/roadmaps/${id}`, roadmap);
    return response.data;
  }

  async deleteRoadmap(id: number): Promise<void> {
    await this.client.delete(`/roadmaps/${id}`);
  }

  // Roadmap Steps
  async createRoadmapStep(roadmapId: number, step: Partial<RoadmapStep>): Promise<RoadmapStep> {
    const response = await this.client.post(`/roadmaps/${roadmapId}/steps`, step);
    return response.data;
  }

  async updateRoadmapStep(id: number, step: Partial<RoadmapStep>): Promise<RoadmapStep> {
    const response = await this.client.put(`/roadmap-steps/${id}`, step);
    return response.data;
  }

  async deleteRoadmapStep(id: number): Promise<void> {
    await this.client.delete(`/roadmap-steps/${id}`);
  }

  // Health
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const api = new ApiClient();