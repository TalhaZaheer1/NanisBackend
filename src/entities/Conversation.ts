import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  title!: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  user!: User;

  @OneToMany(() => Message, (message) => message.conversation, { cascade: true })
  messages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
