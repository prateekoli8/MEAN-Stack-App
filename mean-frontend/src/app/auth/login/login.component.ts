import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
isLoading = false;
private authStatusSub: Subscription;

constructor(private authService: AuthService) {}

ngOnInit() {
  this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
    authStatus => {this.isLoading = false;}
  );
}

onLogin(loginForm: NgForm) {
  if (loginForm.invalid) {
    return;
  }
  this.isLoading = true;
  this.authService.login(loginForm.value.email, loginForm.value.password);
}

ngOnDestroy() {
  this.authStatusSub.unsubscribe();
}

}
