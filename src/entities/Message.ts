import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Conversation } from "./Conversation";

export type MessageType = "text" | "image" | "audio" | "file" | "system";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: "CASCADE",
  })
  conversation!: Conversation;

  @Column({ type: "enum", enum: ["text", "image", "audio", "file", "system"] })
  type!: MessageType;

  @Column()
  role!: "user" | "assistant" | "system";

  @Column({ type: "text" })
  content!: string;

  @Column({ nullable: true })
  fileUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
