import { Post } from './post-list/post.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { post } from 'selenium-webdriver/http';

@Injectable()
export class PostsService {
  private posts: Post[] = [];
  private postsChanged = new Subject<{ posts: Post[] , postsCount: number }>();
  constructor(private httpClient: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, page: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${page}`;
    this.httpClient.get<{message: String, posts: any, maxPosts: number}>('http://localhost:3000/messages/posts' + queryParams)
    .pipe(
      map(postData => {
        // tslint:disable-next-line:no-shadowed-variable
        return {posts: postData.posts.map(post => {
          return {title: post.title, content: post.content, id: post._id, imagePath: post.imagePath,
          creator: post.creator};
        }), maxPosts: postData.maxPosts};
    })
    ).subscribe(
      transformedPostsData => {
        this.posts = transformedPostsData.posts;
        this.postsChanged.next({posts: [...this.posts], postsCount: transformedPostsData.maxPosts});
      }
    );
  }

  deletePost(postId: String) {
    return this.httpClient.delete('http://localhost:3000/messages/posts/' + postId);
  }

  getPostsUpdatedListener() {
    return this.postsChanged.asObservable();
  }

  getPost(id: string) {
    return this.httpClient.get<{message: string, post: Post}>('http://localhost:3000/messages/post/' + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.httpClient.post<{message: string, post: Post}>('http://localhost:3000/messages/posts', postData).subscribe(
      responseData => {
        this.router.navigate(['/']);
      }
    );
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.httpClient.put<{message: string}>('http://localhost:3000/messages/post/' + id, postData).subscribe(
      responseData => {
        this.router.navigate(['/']);
      }
    );
  }
}
