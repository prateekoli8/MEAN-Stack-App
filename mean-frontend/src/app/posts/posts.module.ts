import { NgModule } from '@angular/core';
import { PostCreateComponent } from './create-post/create-post.component';
import { PostListComponent } from './post-list/post-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';

@NgModule({
declarations: [
  PostCreateComponent,
  PostListComponent
],
imports: [
  CommonModule,
  ReactiveFormsModule,
  AngularMaterialModule,
  AppRoutingModule
]
})
export class PostsModule {}
