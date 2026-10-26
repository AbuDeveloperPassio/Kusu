import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title?: string;
  content?: string;
  pinned?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly http = inject(HttpClient);

  list(q = ''): Promise<{ notes: Note[] }> {
    let params = new HttpParams();
    if (q.trim()) params = params.set('q', q.trim());
    return firstValueFrom(this.http.get<{ notes: Note[] }>('/api/notes', { params }));
  }

  create(input: NoteInput): Promise<{ note: Note }> {
    return firstValueFrom(this.http.post<{ note: Note }>('/api/notes', input));
  }

  update(id: string, input: NoteInput): Promise<{ note: Note }> {
    return firstValueFrom(this.http.put<{ note: Note }>(`/api/notes/${id}`, input));
  }

  remove(id: string): Promise<{ ok: boolean }> {
    return firstValueFrom(this.http.delete<{ ok: boolean }>(`/api/notes/${id}`));
  }
}
