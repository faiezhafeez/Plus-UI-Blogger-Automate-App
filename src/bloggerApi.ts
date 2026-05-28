/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Blog, BlogPost } from './types';

const BASE_URL = 'https://www.googleapis.com/blogger/v3';

/**
 * Custom error class for Blogger API failures
 */
export class BloggerApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'BloggerApiError';
    this.status = status;
  }
}

/**
 * General fetch wrapper to inject Auth header and handle basic responses
 */
async function bloggerFetch<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    ...(options.headers || {}),
  } as HeadersInit;

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Blogger API request failed [${response.status}]`;
    try {
      const errorJson = await response.json();
      if (errorJson?.error?.message) {
        errorMessage = errorJson.error.message;
      }
    } catch {
      // ignore JSON parse errors for non-JSON error pages
    }
    throw new BloggerApiError(errorMessage, response.status);
  }

  // Handle DELETE (204 No Content has no body)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch list of blogs for the currently authenticated user
 */
export async function fetchUserBlogs(token: string): Promise<Blog[]> {
  try {
    const data = await bloggerFetch<{ items?: Blog[] }>('/users/self/blogs', token);
    return data.items || [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}

/**
 * Fetch posts for a specific blog
 * Includes drafts and scheduled posts if selected
 */
export async function fetchBlogPosts(
  blogId: string,
  token: string,
  status: 'all' | 'live' | 'draft' | 'scheduled' = 'all'
): Promise<BlogPost[]> {
  try {
    // Construct statuses list
    let statusParam = 'live,draft,scheduled';
    if (status === 'live') statusParam = 'live';
    if (status === 'draft') statusParam = 'draft';
    if (status === 'scheduled') statusParam = 'scheduled';

    const endpoint = `/blogs/${blogId}/posts?status=${statusParam}&maxResults=50&fetchBodies=true`;
    const data = await bloggerFetch<{ items?: BlogPost[] }>(endpoint, token);
    return data.items || [];
  } catch (error) {
    console.error(`Error fetching posts for blog ${blogId}:`, error);
    throw error;
  }
}

/**
 * Fetch a single blog post by ID
 */
export async function fetchBlogPost(
  blogId: string,
  postId: string,
  token: string
): Promise<BlogPost> {
  return bloggerFetch<BlogPost>(`/blogs/${blogId}/posts/${postId}`, token);
}

/**
 * Create a new blog post
 */
export async function createBlogPost(
  blogId: string,
  token: string,
  post: { title: string; content: string; labels?: string[] },
  isDraft: boolean = true
): Promise<BlogPost> {
  const endpoint = `/blogs/${blogId}/posts?isDraft=${isDraft}`;
  return bloggerFetch<BlogPost>(endpoint, token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kind: 'blogger#post',
      blog: { id: blogId },
      title: post.title,
      content: post.content,
      labels: post.labels || [],
    }),
  });
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(
  blogId: string,
  postId: string,
  token: string,
  post: { title: string; content: string; labels?: string[] }
): Promise<BlogPost> {
  const endpoint = `/blogs/${blogId}/posts/${postId}`;
  return bloggerFetch<BlogPost>(endpoint, token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kind: 'blogger#post',
      id: postId,
      blog: { id: blogId },
      title: post.title,
      content: post.content,
      labels: post.labels || [],
    }),
  });
}

/**
 * Publish a draft post
 */
export async function publishBlogPost(
  blogId: string,
  postId: string,
  token: string
): Promise<BlogPost> {
  const endpoint = `/blogs/${blogId}/posts/${postId}/publish`;
  return bloggerFetch<BlogPost>(endpoint, token, {
    method: 'POST',
  });
}

/**
 * Revert a published post to a draft
 */
export async function revertBlogPost(
  blogId: string,
  postId: string,
  token: string
): Promise<BlogPost> {
  const endpoint = `/blogs/${blogId}/posts/${postId}/revert`;
  return bloggerFetch<BlogPost>(endpoint, token, {
    method: 'POST',
  });
}

/**
 * Delete a blog post (destructive)
 */
export async function deleteBlogPost(
  blogId: string,
  postId: string,
  token: string
): Promise<void> {
  const endpoint = `/blogs/${blogId}/posts/${postId}`;
  await bloggerFetch<void>(endpoint, token, {
    method: 'DELETE',
  });
}
