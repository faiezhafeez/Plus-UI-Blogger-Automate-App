/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Blog {
  id: string;
  name: string;
  description: string;
  published: string;
  updated: string;
  url: string;
  selfLink: string;
  posts: {
    totalItems: number;
    selfLink: string;
  };
  pages: {
    totalItems: number;
    selfLink: string;
  };
  locale: {
    language: string;
    country: string;
    variant: string;
  };
}

export interface BlogPost {
  id?: string;
  blog: {
    id: string;
  };
  published?: string;
  updated?: string;
  url?: string;
  selfLink?: string;
  title: string;
  content: string;
  author?: {
    id: string;
    displayName: string;
    url: string;
    image: {
      url: string;
    };
  };
  replies?: {
    totalItems: string;
    selfLink: string;
  };
  labels?: string[];
  status?: 'LIVE' | 'DRAFT' | 'SCHEDULED';
}

export interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
