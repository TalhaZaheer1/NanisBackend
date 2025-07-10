import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum MessageRole {
  USER = "user",
  BOT = "bot"
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  conversationId!:string;

  @Column()
  content!:string;

  @Column({type:"enum",enum:MessageRole,default:MessageRole.BOT})
  role!:MessageRole

  @CreateDateColumn()
  createdAt!:Date;

  @UpdateDateColumn()
  updatedAt!:Date;
}
