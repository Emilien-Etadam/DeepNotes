import { sleep } from '@stdlib/misc';

export interface DeepBtnBaseProps {
  delay?: boolean;
}

export function useDeepBtnBase(props: DeepBtnBaseProps) {
  const loading = ref(false);

  async function onClick(args: any[], attrs: any) {
    if (attrs.onClick == null) {
      return;
    }

    args[0].preventDefault();

    loading.value = true;

    if (props.delay) {
      await sleep(500);
    }

    try {
      await attrs.onClick(...args);
    } catch (error) {
      mainLogger.error(error);
    }

    loading.value = false;
  }

  return {
    loading,
    onClick,
  };
}
