import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({nullable:true})
  name!: string; 

  // @Column({default:true})
  // isNew!:boolean;

  @CreateDateColumn()
  createdAt!:Date;

  @UpdateDateColumn()
  updatedAt!:Date;
}
