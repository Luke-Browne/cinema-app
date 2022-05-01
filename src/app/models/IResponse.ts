import { IFilm } from './IFilm'

export interface IResponse {

    body:{
        Items:{
            IFilm: IFilm;
        }[]
    }

}