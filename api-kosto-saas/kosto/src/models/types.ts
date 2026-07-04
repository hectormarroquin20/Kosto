// src/models/types.ts

import { Resource } from "./resource.interface";

// Tipo útil para cuando insertamos un nuevo recurso (no enviamos ID ni fechas)
export type CreateResourceDTO = Omit<Resource, 'id' | 'created_at' | 'updated_at'>;