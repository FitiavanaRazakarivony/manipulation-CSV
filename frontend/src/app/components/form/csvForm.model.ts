export class Formcsv {
  nameFile?: string;
  nameOutPut?: string;
  typeJoin?: string;
  file: File;

  constructor(file: File | null, nameFile: string, nameOutPut: string, typeJoin: string) {
    if (!file) {
      throw new Error("Le fichier est requis.");
    }
    this.file = file;
    this.nameFile = nameFile;
    this.nameOutPut = nameOutPut;
    this.typeJoin = typeJoin;
  }
}
