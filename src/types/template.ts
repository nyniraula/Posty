/* ──────────────────────────────────────────────────
   Template field types — shared between client & server
   ────────────────────────────────────────────────── */

export interface TextField {
  id: string;
  label: string;
  type: 'text';
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing?: number;
  italic: boolean;
  underline: boolean;
  color: string;
  align: 'left' | 'center' | 'right';
  shadow?: boolean;
}

export interface ImageField {
  id: string;
  label: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  crop: boolean;
  shadow?: boolean;
  cornerRadius?: number;
}

export type Field = TextField | ImageField;

export interface Template {
  id?: string;
  name: string;
  background: string;
  width: number;
  height: number;
  fields: Field[];
  createdAt?: string;
  updatedAt?: string;
}

/* ── Helper type guards ── */

export function isTextField(field: Field): field is TextField {
  return field.type === 'text';
}

export function isImageField(field: Field): field is ImageField {
  return field.type === 'image';
}

/* ── Defaults for new fields ── */

export const DEFAULT_TEXT_FIELD: Omit<TextField, 'id' | 'x' | 'y'> = {
  label: 'New Text Field',
  type: 'text',
  fontFamily: 'Inter',
  fontSize: 32,
  fontWeight: 400,
  letterSpacing: 0,
  italic: false,
  underline: false,
  color: '#FFFFFF',
  align: 'center',
  shadow: false,
};

export const DEFAULT_IMAGE_FIELD: Omit<ImageField, 'id' | 'x' | 'y'> = {
  label: 'New Image',
  type: 'image',
  width: 200,
  height: 200,
  crop: false,
  shadow: false,
  cornerRadius: 0,
};

/* ── Builder tool modes ── */

export type ToolMode = 'select' | 'text' | 'image';

/* ── Supported poster fonts ── */

export const POSTER_FONTS = [
  'Google Sans',
  'Inter',
  'Montserrat',
  'Oswald',
  'Playfair Display',
] as const;

export type PosterFont = (typeof POSTER_FONTS)[number];
