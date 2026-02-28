export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('click-outside', {
    mounted(el: any, binding) {
      el.clickOutsideEvent = (event: Event) => {
        if (!(el === event.target || el.contains(event.target as Node))) {
          binding.value(event);
        }
      };
      document.addEventListener("click", el.clickOutsideEvent);
    },
    unmounted(el: any) {
      document.removeEventListener("click", el.clickOutsideEvent);
    },
    getSSRProps (binding, vnode) {
      // you can provide SSR-specific props here
      return {}
    }
  });
});
