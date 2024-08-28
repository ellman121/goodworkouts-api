import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";
import { Model, Column, DataType, Table, HasMany } from "sequelize-typescript";

import { Exercise } from "./exercise.model";

@Table({ tableName: "users" })
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @Column({ type: DataType.STRING })
  declare email: string;

  @Column({ type: DataType.STRING })
  declare username: string;

  @Column({ type: DataType.STRING })
  declare password: string;

  @HasMany(() => Exercise)
  declare exercises?: NonAttribute<Exercise[]>;
}
