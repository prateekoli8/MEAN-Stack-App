import { Component, OnInit, OnDestroy } from '@angular/core';

import { Post } from './post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
totalPosts = 0;
postsPerPage = 2;
pageSizeOptions = [ 1 , 2 , 5 , 10 ];
currentPage = 1;
posts: Post[] = [];
userId: string;
userIsAuthenticated = false;
private authListenerSub: Subscription;
private postSub: Subscription;
isLoading = false;
  constructor(private postService: PostsService, private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.postSub = this.postService.getPostsUpdatedListener()
    .subscribe(updatedPosts => {
      this.isLoading = false;
      this.posts = updatedPosts.posts;
      this.totalPosts = updatedPosts.postsCount;
    });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  onChangedPage(pageEvent: PageEvent) {
    this.isLoading = true;
    this.postsPerPage = pageEvent.pageSize;
    this.currentPage = pageEvent.pageIndex + 1;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: String) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    }, () => {
      this.isLoading = false;
    } );
  }

  ngOnDestroy() {
    this.postSub.unsubscribe();
    this.authListenerSub.unsubscribe();
  }
}
