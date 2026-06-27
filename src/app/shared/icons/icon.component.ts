import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Iconos lucide-style (stroke 1.6) migrados del prototipo (components.jsx).
 * Uso: <app-icon name="paw" [size]="20" [stroke]="2.4" />
 */
export type IconName =
  | 'dashboard'
  | 'paw'
  | 'stethoscope'
  | 'cart'
  | 'receipt'
  | 'box'
  | 'users'
  | 'activity'
  | 'settings'
  | 'search'
  | 'bell'
  | 'plus'
  | 'chevrons-left'
  | 'log-out'
  | 'trend-up'
  | 'money'
  | 'calendar'
  | 'alert-triangle'
  | 'arrow-right'
  | 'chevron-right'
  | 'chevron-left'
  | 'print'
  | 'filter'
  | 'syringe'
  | 'scissors'
  | 'eye'
  | 'phone'
  | 'map-pin'
  | 'file-text'
  | 'edit'
  | 'image'
  | 'mail'
  | 'pill'
  | 'heart'
  | 'check'
  | 'x'
  | 'refresh'
  | 'undo'
  | 'sparkles'
  | 'thermometer'
  | 'lungs'
  | 'scale'
  | 'credit-card'
  | 'smartphone'
  | 'bone'
  | 'copy'
  | 'key'
  | 'shield'
  | 'lock'
  | 'menu';

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      [attr.fill]="fill"
      stroke="currentColor"
      [attr.stroke-width]="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.class]="class"
    >
      @switch (name) {
        @case ('dashboard') {
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        }
        @case ('paw') {
          <circle cx="11" cy="4.5" r="1.8" />
          <circle cx="17.5" cy="7.5" r="1.8" />
          <circle cx="4.5" cy="7.5" r="1.8" />
          <circle cx="7" cy="13" r="1.8" />
          <path d="M11 9.5c-3 0-6 3-6 5.5 0 2 1.5 3 3 3 1 0 1.8-.5 3-.5s2 .5 3 .5c1.5 0 3-1 3-3 0-2.5-3-5.5-6-5.5z" />
        }
        @case ('stethoscope') {
          <path d="M6 3v6a4 4 0 0 0 8 0V3" />
          <path d="M6 3h-1" />
          <path d="M14 3h1" />
          <path d="M10 17v-4" />
          <circle cx="18" cy="14" r="3" />
          <path d="M10 17a4 4 0 0 0 5 4 4 4 0 0 0 4-4v-1" />
        }
        @case ('cart') {
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M3 4h2l2.5 12h12l2-8H6" />
        }
        @case ('receipt') {
          <path d="M5 3v18l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2 2V3l-2 2-2.5-2-2.5 2-2.5-2-2.5 2L5 3z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        }
        @case ('box') {
          <path d="M21 8l-9-5-9 5 9 5 9-5z" />
          <path d="M3 8v8l9 5 9-5V8" />
          <path d="M12 13v8" />
        }
        @case ('users') {
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M17 14c2.5 0 4.5 1.8 4.5 4" />
        }
        @case ('activity') {
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
          />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.5-4.5" />
        }
        @case ('bell') {
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('chevrons-left') {
          <path d="M11 17l-5-5 5-5" />
          <path d="M18 17l-5-5 5-5" />
        }
        @case ('log-out') {
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        }
        @case ('trend-up') {
          <path d="M22 7l-8.5 8.5-5-5L2 17" />
          <path d="M16 7h6v6" />
        }
        @case ('money') {
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 12h.01M18 12h.01" />
        }
        @case ('calendar') {
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        }
        @case ('alert-triangle') {
          <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M12 5l7 7-7 7" />
        }
        @case ('chevron-right') {
          <path d="M9 18l6-6-6-6" />
        }
        @case ('chevron-left') {
          <path d="M15 18l-6-6 6-6" />
        }
        @case ('print') {
          <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        }
        @case ('filter') {
          <path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" />
        }
        @case ('syringe') {
          <path d="M18 2l4 4" />
          <path d="M16 4l4 4-9 9-4 1-1 1-3-3 1-1 1-4z" />
          <path d="M9 11l4 4" />
        }
        @case ('scissors') {
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12" />
        }
        @case ('eye') {
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        }
        @case ('phone') {
          <path
            d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"
          />
        }
        @case ('map-pin') {
          <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="3" />
        }
        @case ('file-text') {
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        }
        @case ('edit') {
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        }
        @case ('image') {
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        }
        @case ('mail') {
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        }
        @case ('pill') {
          <rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-45 12 12)" />
          <path d="M8.5 8.5l7 7" />
        }
        @case ('heart') {
          <path
            d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"
          />
        }
        @case ('check') {
          <path d="M4 12l5 5L20 6" />
        }
        @case ('x') {
          <path d="M18 6L6 18M6 6l12 12" />
        }
        @case ('refresh') {
          <path d="M21 12a9 9 0 0 1-15.6 6.2L1 14" />
          <path d="M3 12a9 9 0 0 1 15.6-6.2L23 10" />
          <path d="M1 4v6h6M23 20v-6h-6" />
        }
        @case ('undo') {
          <path d="M9 14L4 9l5-5" />
          <path d="M4 9h11a6 6 0 0 1 0 12H10" />
        }
        @case ('sparkles') {
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
          <path d="M19 17l.7 1.8L21.5 19.5l-1.8.7L19 22l-.7-1.8L16.5 19.5l1.8-.7L19 17z" />
        }
        @case ('thermometer') {
          <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" />
        }
        @case ('lungs') {
          <path d="M12 4v8" />
          <path d="M9 12c0-2-1.5-3-3.5-3-1 0-1.5.8-1.5 2 0 3 .5 5.5 1 7 .3.9 1.1 1 2 1s1.5-.4 1.5-1.3V12z" />
          <path d="M15 12c0-2 1.5-3 3.5-3 1 0 1.5.8 1.5 2 0 3-.5 5.5-1 7-.3.9-1.1 1-2 1s-1.5-.4-1.5-1.3V12z" />
        }
        @case ('scale') {
          <path d="M12 3v18" />
          <path d="M7 21h10" />
          <path d="M5 7h2c2 0 5-1 7-2 2 1 5 2 7 2" />
          <path d="M2 16l3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1z" />
          <path d="M16 16l3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1z" />
        }
        @case ('credit-card') {
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        }
        @case ('smartphone') {
          <rect x="6" y="2" width="12" height="20" rx="2" />
          <path d="M11 18h2" />
        }
        @case ('bone') {
          <path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5z" />
        }
        @case ('copy') {
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        }
        @case ('key') {
          <circle cx="8" cy="15" r="4" />
          <path d="M10.8 12.2 20 3" />
          <path d="M17 6l2.5 2.5" />
          <path d="M15 8l2 2" />
        }
        @case ('shield') {
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        }
        @case ('lock') {
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        }
        @case ('menu') {
          <path d="M3 6h18M3 12h18M3 18h18" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size = 20;
  @Input() stroke = 1.6;
  @Input() fill = 'none';
  @Input() class = '';
}
