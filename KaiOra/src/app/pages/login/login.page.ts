import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  toastConfig = { isOpen: false, message: '', color: '' };

  constructor(
    private auth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.showToast('Por favor, complete todos los campos', 'danger');
      return;
    }

    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(
        this.email,
        this.password
      );

      if (userCredential.user) {
        // Obtener el nombre de usuario desde Firestore
        const userId = userCredential.user.uid;
        const userDoc = await this.firestore.collection('users').doc(userId).get().toPromise();

        // Verificar si el documento existe y es válido
        if (userDoc && userDoc.exists) {
          const userData = userDoc.data() as { username: string };  // Acceder a los datos del documento
          const username = userData?.username || 'Usuario';  // Usar 'Usuario' si no existe el nombre de usuario

          // Mostrar el toast con el mensaje personalizado
          this.showToast(`Bienvenido ${username}`, 'success');
          this.email = '';  // Limpiar el input de email
          this.password = '';  // Limpiar el input de password
          this.router.navigate(['/home']);
        } else {
          this.showToast('Usuario no encontrado', 'danger');
        }

        // Limpiar los inputs y redirigir al home
        this.email = '';
        this.password = '';
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      this.showToast('Correo o contraseña no válidos', 'danger');
    }
  }

  private showToast(message: string, color: string) {
    this.toastConfig = { isOpen: true, message, color };
    setTimeout(() => (this.toastConfig.isOpen = false), 1500);
  }
}
