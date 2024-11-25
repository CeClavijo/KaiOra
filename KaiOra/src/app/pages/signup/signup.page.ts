import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  registerForm: FormGroup;
  toastConfig = { isOpen: false, message: '', color: '' };

  constructor(
    private fb: FormBuilder,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.registerForm = this.fb.group({
      username: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]{3,16}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(6), Validators.pattern(/^[^\s]+$/)],
      ],
    });
  }

  async registerUser() {
    const { username, email, password } = this.registerForm.value;

    if (!username || !email || !password) {
      this.showToast('Por favor rellene el formulario si desea continuar', 'danger');
      return;
    }

    try {
      const usernameExists = await this.firestore
        .collection('users', (ref) => ref.where('username', '==', username))
        .get()
        .toPromise();

      if (usernameExists && !usernameExists.empty) {
        this.showToast('Nombre de usuario ya ocupado', 'danger');
        return;
      }

      const emailExists = await this.auth.fetchSignInMethodsForEmail(email);
      if (emailExists.length > 0) {
        this.showToast('Correo ya ocupado', 'danger');
        return;
      }

      const userCredential = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const userId = userCredential.user?.uid;

      if (userId) {
        await this.firestore.collection('users').doc(userId).set({username});
        this.showToast('Usuario registrado exitosamente', 'success');
        this.registerForm.reset();
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.showToast('Correo ya ocupado', 'danger');
      } else if (error.code === 'auth/invalid-email') {
        this.showToast('Ingrese un correo válido', 'danger');
      } else if (error.code === 'auth/weak-password') {
        this.showToast('Tienes que ingresar una contraseña de mínimo 6 caracteres', 'danger');
      } else {
        this.showToast(`Error al registrar usuario: ${error.message}`, 'danger');
      }
    }
  }

  private showToast(message: string, color: string) {
    this.toastConfig = { isOpen: true, message, color };
    setTimeout(() => (this.toastConfig.isOpen = false), 1500);
  }
}
