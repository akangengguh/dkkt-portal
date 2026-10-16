#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/a676691d9746868d6933fe464aa9e66a46ae905011dae594e9f09c2b9d33723a/contract';
import startContract from '../../snapshots/a676691d9746868d6933fe464aa9e66a46ae905011dae594e9f09c2b9d33723a/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d59b51fbab959fe51c1c2fb53606a91d0947180f36fe6d66edeb1c66a0c0ec3f/contract';
import endContract from '../../snapshots/d59b51fbab959fe51c1c2fb53606a91d0947180f36fe6d66edeb1c66a0c0ec3f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('artistId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_artistId_key',
        columns: ['artistId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'user',
        foreignKey: {
          name: 'user_artistId_fkey',
          columns: ['artistId'],
          references: { schema: 'public', table: 'artist', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
