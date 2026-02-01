import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Organizer } from '../models/Organizer';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServOrganizersJson {

  private organizersUrl = `${environment.apiUrl}/organizers`;

  constructor(private httpclient: HttpClient) {}

  getOrganizers(): Observable<Organizer[]> {
    return this.httpclient.get<Organizer[]>(this.organizersUrl);
  }

  getOrganizerById(id: number): Observable<Organizer> {
    return this.httpclient.get<Organizer>(`${this.organizersUrl}/${id}`);
  }

  getActiveOrganizers(): Observable<Organizer[]> {
    return this.httpclient.get<Organizer[]>(this.organizersUrl)
      .pipe(map(orgs => orgs.filter(o => o.active === true)));
  }

  //search
  searchOrganizers(filters: any): Observable<Organizer[]> {
    return this.httpclient.get<Organizer[]>(this.organizersUrl).pipe(
      map(organizers =>
        organizers.filter(o => {
          let ok = true;
          // Filtro por nombre
          if (filters.name && filters.name.trim() !== '') {
            ok = ok && o.name.toLowerCase()
              .includes(filters.name.toLowerCase());
          }
          // Filtro por correo
          if (filters.email && filters.email.trim() !== '') {
            ok = ok && o.email.toLowerCase()
              .includes(filters.email.toLowerCase());
          }
          // Filtro por departamento
          if (filters.department && filters.department.trim() !== '') {
            ok = ok && o.department.toLowerCase()
              .includes(filters.department.toLowerCase());
          }
          // Filtro por cargo
          if (filters.position && filters.position.trim() !== '') {
            ok = ok && o.position.toLowerCase()
              .includes(filters.position.toLowerCase());
          }
          // Filtro por turno
          if (filters.shift && filters.shift.trim() !== '') {
            ok = ok && o.shifts.some(s =>
              s.toLowerCase().includes(filters.shift.toLowerCase())
            );
          }
          return ok;
        })
      )
    );
  }

  create(organizer: Organizer): Observable<Organizer> {
    return this.httpclient.post<Organizer>(this.organizersUrl, organizer);
  }

  update(organizer: Organizer): Observable<Organizer> {
    let url = `${this.organizersUrl}/${organizer.id}`;
    return this.httpclient.put<Organizer>(url, organizer);
  }

  delete(id: any): Observable<Organizer> {
    let url = `${this.organizersUrl}/${id}`;
    return this.httpclient.delete<Organizer>(url);
  }
}
