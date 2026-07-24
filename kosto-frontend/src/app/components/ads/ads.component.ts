import { Component, ElementRef, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { AdService } from '../../core/services/ad.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  styles: [`
    .ad-banner-container {
      width: 100%;
      height: 100%;
      min-height: 250px;
      background-color: #f8f9fa;
      border-left: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      text-align: center;
    }
  `],
  template: `
    <div class="ad-banner-container">
      <!-- Contenedor donde se renderizará el banner de Adsterra / Monetag -->
      <div #adContainer class="w-full flex justify-center items-center"></div>

      <!-- Fallback automático si el AdBlock bloquea el script -->
      @if (adBlocked()) {
        <div class="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          <p class="font-semibold">¿Usas bloqueador de anuncios?</p>
          <p class="text-xs mt-1 text-amber-700">
            Apoya el mantenimiento de <strong>insummi</strong> desactivando tu AdBlocker o actualiza a Pro.
          </p>
          <a 
            href="/subscription" 
            class="mt-3 inline-block px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors">
            Eliminar anuncios con Pro
          </a>
        </div>
      }
    </div>
  `
})
export class AdBannerComponent implements OnInit {
  adService = inject(AdService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  // Referencia al div contenedor
  @ViewChild('adContainer', { static: true }) adContainer!: ElementRef;

  // Signal para detectar si el script fue bloqueado
  adBlocked = signal(false);

  ngOnInit(): void {
    this.loadAdScript();
  }

  private loadAdScript(): void {

    // if (this.showAds) {
    // Ads
    const headPopup = this.document.head;
    const adsPopup = this.document.createElement('script');

    // Configurar los atributos que requiere tu tag externo
    adsPopup.dataset['zone'] = '11387139';
    adsPopup.src = 'https://nap5k.com/tag.min.js';
    adsPopup.async = true; // Recomendado para que no bloquee la carga de la página

    headPopup.appendChild(adsPopup);

    // 1. Apuntar obligatoriamente al body, no al head
    const target = this.document.body;
    const adsPush = this.document.createElement('script');

    // 2. Configurar exactamente los parámetros del script original
    adsPush.dataset['zone'] = '11388364';
    adsPush.src = 'https://n6wxm.com/vignette.min.js';
    adsPush.async = true;

    // 3. Insertar en la página
    target.appendChild(adsPush);
    // }

    // 1. Configuración de parámetros que exige la red (Ejemplo: Adsterra)
    // Muchas redes piden definir variables globales en 'window' antes del script:
    (window as any).atOptions = {
      'key': 'xxxxxx',
      'format': 'iframe',
      'height': 300,
      'width': 160,
      'params': {}
    };

    // 2. Creación e inyección dinámica del elemento <script>
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    // Reemplaza esta URL con el script que te entregue Adsterra/Monetag
    script.src = '//www.highperformanceformat.com/TU_ANUNCIO_KEY_AQUI/invoke.js';
    script.async = true;

    // 3. Listener para detectar si un AdBlock impide cargar el script
    script.onerror = () => {
      this.adBlocked.set(true);
    };

    // Inyectamos el script dentro de nuestro contenedor
    this.renderer.appendChild(this.adContainer.nativeElement, script);
  }
}
