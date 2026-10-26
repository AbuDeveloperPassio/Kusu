import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { errorMessage } from '../../core/auth.service';
import { Note, NotesService } from '../../core/notes.service';

@Component({
  selector: 'app-notes',
  imports: [FormsModule, DatePipe],
  template: `
    <div class="notes-layout" [class.editing]="editing()">
      <aside class="notes-list">
        <div class="list-head">
          <input
            type="search"
            name="search"
            placeholder="Search notes…"
            aria-label="Search notes"
            [ngModel]="query()"
            (ngModelChange)="onSearch($event)"
          />
          <button class="btn primary" type="button" (click)="newNote()">+ New</button>
        </div>

        @if (loading()) {
          <p class="muted pad">Loading…</p>
        } @else if (notes().length === 0) {
          <p class="muted pad">
            {{ query() ? 'No notes match your search.' : 'No notes yet. Tap “+ New” to write your first one.' }}
          </p>
        } @else {
          <ul>
            @for (n of notes(); track n.id) {
              <li>
                <div
                  class="note-item"
                  role="button"
                  tabindex="0"
                  [class.active]="n.id === selectedId()"
                  (click)="open(n)"
                  (keydown.enter)="open(n)"
                >
                  <div class="note-item-top">
                    <strong>{{ n.title }}</strong>
                    <button
                      class="pin"
                      type="button"
                      [class.on]="n.pinned"
                      [attr.aria-label]="n.pinned ? 'Unpin note' : 'Pin note'"
                      (click)="togglePin(n, $event)"
                    >★</button>
                  </div>
                  <span class="preview">{{ n.content || 'No content' }}</span>
                  <span class="muted small">{{ n.updatedAt | date: 'MMM d, y, h:mm a' }}</span>
                </div>
              </li>
            }
          </ul>
        }
      </aside>

      <section class="editor">
        @if (editing()) {
          <button class="btn ghost back" type="button" (click)="closeEditor()">← All notes</button>

          <label for="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            maxlength="150"
            placeholder="Give your note a title"
            [ngModel]="title()"
            (ngModelChange)="title.set($event)"
          />

          <label for="content">Note</label>
          <textarea
            id="content"
            name="content"
            rows="14"
            maxlength="20000"
            placeholder="Write something…"
            [ngModel]="content()"
            (ngModelChange)="content.set($event)"
          ></textarea>

          <label class="check">
            <input
              type="checkbox"
              name="pinned"
              [ngModel]="pinned()"
              (ngModelChange)="pinned.set($event)"
            />
            Pin to top
          </label>

          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }

          <div class="actions">
            <button class="btn primary" type="button" [disabled]="saving()" (click)="save()">
              {{ saving() ? 'Saving…' : selectedId() ? 'Save changes' : 'Create note' }}
            </button>
            @if (selectedId()) {
              <button class="btn danger" type="button" [disabled]="saving()" (click)="remove()">Delete</button>
            }
          </div>
        } @else {
          <div class="empty">
            <h2>Your notes</h2>
            <p class="muted">Pick a note from the list or start a new one.</p>
            <button class="btn primary" type="button" (click)="newNote()">+ New note</button>
          </div>
        }
      </section>
    </div>
  `,
})
export class NotesPage {
  private readonly api = inject(NotesService);

  readonly notes = signal<Note[]>([]);
  readonly query = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');

  readonly editing = signal(false);
  readonly selectedId = signal<string | null>(null);
  readonly title = signal('');
  readonly content = signal('');
  readonly pinned = signal(false);

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    try {
      const res = await this.api.list(this.query());
      this.notes.set(res.notes);
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(value: string): void {
    this.query.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => void this.load(), 250);
  }

  newNote(): void {
    this.selectedId.set(null);
    this.title.set('');
    this.content.set('');
    this.pinned.set(false);
    this.error.set('');
    this.editing.set(true);
  }

  open(note: Note): void {
    this.selectedId.set(note.id);
    this.title.set(note.title);
    this.content.set(note.content);
    this.pinned.set(note.pinned);
    this.error.set('');
    this.editing.set(true);
  }

  closeEditor(): void {
    this.editing.set(false);
    this.selectedId.set(null);
  }

  async save(): Promise<void> {
    const title = this.title().trim();
    if (!title) {
      this.error.set('Please add a title.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    try {
      const input = { title, content: this.content(), pinned: this.pinned() };
      const id = this.selectedId();
      const res = id ? await this.api.update(id, input) : await this.api.create(input);
      this.selectedId.set(res.note.id);
      await this.load();
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(): Promise<void> {
    const id = this.selectedId();
    if (!id || !confirm('Delete this note? This cannot be undone.')) return;
    this.saving.set(true);
    try {
      await this.api.remove(id);
      this.closeEditor();
      await this.load();
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  async togglePin(note: Note, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await this.api.update(note.id, { pinned: !note.pinned });
      if (this.selectedId() === note.id) this.pinned.set(!note.pinned);
      await this.load();
    } catch (err) {
      this.error.set(errorMessage(err));
    }
  }
}
