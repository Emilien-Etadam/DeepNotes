import { enableVueBindings } from '@syncedstore/core';
import * as Vue from 'vue';

import type { BootContext } from './boot-context';

enableVueBindings(Vue);

export async function setup(_ctx: BootContext) {}
