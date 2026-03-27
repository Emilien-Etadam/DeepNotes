import { canManageRole, type GroupRoleID, roles } from '@deeplib/misc';
import { useRealtimeContext } from 'src/code/areas/realtime/context';
import { useAuthStore } from 'src/stores/auth';
import { computed, ref } from 'vue';

export function useRoleSelector(groupId: () => string) {
  const realtimeCtx = useRealtimeContext();

  const selectedRole = ref<GroupRoleID | null>(null);

  const manageableRoles = computed(() => {
    const selfGroupRole = realtimeCtx.hget(
      'group-member',
      `${groupId()}:${useAuthStore().userId}`,
      'role',
    );

    const result = [];
    for (const role of roles()) {
      if (canManageRole(selfGroupRole, role.id)) {
        result.push(role);
      }
    }
    return result;
  });

  return { selectedRole, manageableRoles };
}
