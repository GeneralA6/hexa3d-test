import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export enum Hexa3dCommunicationActions {
  ViewLoaded= 'viewerFullyLoaded',
  ModelLoaded = 'onModelLoaded',
  GifFinished = 'gif finished',
  GifGenerated = 'gifgen',
  LightsSummary = 'onLightsSummary',
  MaterialManipulations = 'onMaterialManipulations'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  image: string = '';
  iframeUrl: SafeResourceUrl = '';

  private readonly hexa3d = {
    protocol: 'https:',
    hostname: 'v.hexa3d.io',
  };

  @ViewChild('iframe') iframe!: ElementRef;
  @HostListener('window:message', ['$event']) onMessage(message: MessageEvent) {
    this.handleIframeMessage(message);
  }

  constructor(private readonly sanitizer: DomSanitizer) {
  }

  setHexa3dIframeUrl(event: Event) {
    const inputElement: HTMLInputElement = event.target as HTMLInputElement;
    const iframeUrl: string = inputElement.value;
    const isHexa3dUrl: boolean = this.verifyResourceIsFromHexa3d(iframeUrl);

    if (!isHexa3dUrl) {
      this.image = '';
      this.iframeUrl = '';
      return;
    }
    this.iframeUrl = this.getTrustedResourceUrl(iframeUrl)
  }

  downloadImage() {
    const a = document.createElement('a');
    a.href = this.image;
    a.download = "hexa3d.gif";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private verifyResourceIsFromHexa3d(url: string): boolean {
    const urlObject: URL = new URL(url);
    return urlObject.hostname === this.hexa3d.hostname && urlObject.protocol === this.hexa3d.protocol
  }

  private getTrustedResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  private handleIframeMessage(message: MessageEvent) {
    const isHexa3dUrl: boolean = this.verifyResourceIsFromHexa3d(message.origin);
    if (!isHexa3dUrl) {
      return;
    }
    if (message.data?.action === Hexa3dCommunicationActions.GifGenerated) {
      this.image = message.data.image;
    }
  }
}
