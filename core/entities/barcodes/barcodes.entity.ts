import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Barcodes {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column({ unique: true })
  code: string;

  @Column({ default: false })
  checked: boolean;

  @Column({ default: 0 })
  counter: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(args?: { code: string; checked: boolean }) {
    if (args) {
      this.code = args.code;
      this.checked = args.checked;
    }
  }
}
