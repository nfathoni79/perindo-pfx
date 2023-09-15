<script setup>
import { computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'

const props = defineProps({
  open: Boolean,
  large: Boolean,
})

defineEmits(['onClose'])

const maxWidthClass = computed(() => {
  return props.large ? 'sm:max-w-4xl' : 'sm:max-w-lg'
})
</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" @close="$emit('onClose')" class="relative z-10">
      <TransitionChild as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100" leave-to="opacity-0">

        <div class="fixed inset-0 bg-gray-500 bg-opacity-75
          transition-opacity"></div>
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end sm:items-center justify-center
          p-4 sm:p-0 text-center">

          <TransitionChild as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">

            <DialogPanel :class="['sm:my-8 relative sm:w-full',
              'rounded-lg shadow-xl overflow-hidden',
              'bg-white text-left transition-all',
              maxWidthClass]">

              <div class="bg-white px-4 pb-4 pt-5 sm:p-6">
                <slot></slot>
              </div>
            </DialogPanel>
          </TransitionChild>

        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
