import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'user_t' })

export class User_t {
    @PrimaryGeneratedColumn({ name: 'user_id', type: 'int' })
    userId: number;

    @Column({ name: 'first_name', type: 'varchar', length: 100 })
    firstName: string;

    @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
    lastName?: string;

    @Column({ name: 'email_address', type: 'varchar', length: 100, unique: true })
    emailAddress: string;

    @Column({ name: 'user_password', type: 'varchar', length: 100 })
    userPassword: string;

    @Column({ name: 'role_id', type: 'int' })
    roleId: number;

    @Column({ name: 'created_by', type: 'varchar', length: 100 })
    createdBy: string;

    @CreateDateColumn({ name: 'created_at', type: 'date', default: () => 'CURRENT_DATE' })
    createdAt: Date;
}
