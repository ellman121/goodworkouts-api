import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";
import { Model, Column, DataType, Table, HasMany, DeletedAt } from "sequelize-typescript";

import Exercise from "./exercise.model";
import Routine from "./routine.model";

@Table({ tableName: "users" })
export default class User extends Model<
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

  @DeletedAt
  declare deletedAt?: Date | null;

  @HasMany(() => Exercise)
  declare exercises?: NonAttribute<Exercise[]>;

  @HasMany(() => Routine)
  declare routines?: NonAttribute<Routine[]>;
}
