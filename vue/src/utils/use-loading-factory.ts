import { ref, shallowRef, Ref, watch, unref, UnwrapRef } from "vue";

type LoadingStatus = "not-requested" | "loading" | "success" | "error";

export const useLoadingFactory = <T>(
  fn: () => Promise<T>,
  trigger: Parameters<typeof watch>[0],
) => {
  const result = ref<T | null>(null);
  const isLoading = ref(false);
  const loadingError: Ref<any> = shallowRef(null);
  const status = ref<LoadingStatus>("not-requested");

  const handler = async () => {
    try {
      status.value = "loading";
      isLoading.value = true;
      loadingError.value = null;

      result.value = unref(await fn()) as UnwrapRef<T>;
      status.value = "success";
    } catch (err) {
      status.value = "error";
      loadingError.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  watch(trigger, handler, { immediate: true });

  return {
    result,
    status,
    isLoading,
    loadingError,
  };
};
