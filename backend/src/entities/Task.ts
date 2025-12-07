import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("tasks")
export class Task {
  @PrimaryColumn({ type: "char", length: 36 })
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: ["TODO", "IN_PROGRESS", "DONE"],
    default: "TODO"
  })
  status!: "TODO" | "IN_PROGRESS" | "DONE";

  @Column({
    type: "enum",
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "MEDIUM"
  })
  priority!: "LOW" | "MEDIUM" | "HIGH";

  @Column({ type: "timestamp", nullable: true })
  due_date?: Date;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
