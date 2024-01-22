<script setup>
import PlaystoreButton from '../components/PlaystoreButton.vue'
</script>

<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-8 lg:px-12">
    <!-- Mobile view -->
    <div class="flex sm:hidden flex-col space-y-12 px-4 text-center">
      <!-- Mobile: Intro -->
      <div>
        <img src="../assets/pfx-home.png" alt="Home" class="px-12" />

        <h1 class="mb-4 text-3xl text-cyan-600 font-bold leading-normal">
          Lihat pelelangan ikan dalam waktu real time
        </h1>

        <p class="mb-4 text-lg lg:text-2xl text-gray-900 font-normal">
          Dengan Indonesia Fishery Exchange, kamu bisa melihat status pelelangan
          ikan tanpa harus membuat akun. Cek harga dan penawar ikan terbaru
          mulai dari sekarang.
        </p>

        <router-link :to="{ name: 'auction' }"
          class="inline-flex justify-center border-2 border-cyan-600
          rounded-full shadow-lg hover:bg-cyan-600 px-4 py-1
          text-2xl font-medium text-cyan-600 hover:text-white">
          Mulai
        </router-link>
      </div>

      <!-- Mobile: Perindo Bisnis -->
      <div>
        <img src="../assets/perindo-bisnis.png" alt="Perindo Bisnis"
          class="px-12 float-right" />

        <p class="mb-4 text-xl lg:text-2xl text-gray-900 font-normal">
          Ingin <span class="text-cyan-600">berpartisipasi</span> dalam pelelangan?
          Download aplikasi Perindo Bisnis.
        </p>

        <PlaystoreButton href="https://play.google.com/store/apps/details?id=id.perindo.perindo_bisnis_flutter" />
      </div>

      <!-- Mobile: Perindo Nelayan -->
      <div>
        <img src="../assets/perindo-nelayan.png" alt="Perindo Nelayan"
          class="px-12 float-right" />

        <p class="mb-4 text-xl lg:text-2xl text-gray-900 font-normal">
          Ingin <span class="text-cyan-600">melelang</span> hasil tangkapan
          Anda? Download aplikasi Perindo Nelayan.
        </p>

        <PlaystoreButton href="https://play.google.com/store/apps/details?id=id.dayagagas.perindo" />
      </div>
    </div>

    <!-- Desktop view -->
    <div class="hidden sm:flex sm:mb-8 sm:items-center">
      <!-- Left: Intro -->
      <div class="flex-1">
        <h1 class="mb-4 text-4xl lg:text-5xl text-cyan-600 font-bold
          leading-normal lg:leading-normal">
          Lihat pelelangan ikan dalam waktu real time
        </h1>

        <p class="mb-4 text-xl lg:text-2xl text-gray-900 font-normal">
          Dengan Indonesia Fishery Exchange, kamu bisa melihat status pelelangan
          ikan tanpa harus membuat akun. Cek harga dan penawar ikan terbaru
          mulai dari sekarang.
        </p>

        <router-link :to="{ name: 'auction' }"
          class="inline-flex justify-center border-2 border-cyan-600
          rounded-full shadow-lg hover:bg-cyan-600 px-4 py-1
          text-2xl font-medium text-cyan-600 hover:text-white">
          Mulai
        </router-link>
      </div>

      <!-- Right: Intro image -->
      <div class="flex-1 p-4 pr-0">
        <img src="../assets/pfx-home.png" alt="Home" class="float-right" />
      </div>
    </div>

    <div class="hidden sm:flex sm:items-center">
      <!-- Left: Perindo Bisnis -->
      <div class="flex-1">
        <p class="mb-4 text-xl lg:text-2xl text-gray-900 font-normal">
          Ingin <span class="text-cyan-600">berpartisipasi</span> dalam pelelangan?
          Download aplikasi Perindo Bisnis.
        </p>

        <PlaystoreButton href="https://play.google.com/store/apps/details?id=id.perindo.perindo_bisnis_flutter" />
      </div>

      <!-- Right: Perindo Bisnis logo -->
      <div class="flex-1 p-8 pr-0">
        <img src="../assets/perindo-bisnis.png" alt="Perindo Bisnis"
          class="float-right" />
      </div>
    </div>

    <div class="hidden sm:flex sm:items-center">
      <!-- Left: Perindo Nelayan -->
      <div class="flex-1">
        <p class="mb-4 text-xl lg:text-2xl text-gray-900 font-normal">
          Ingin <span class="text-cyan-600">melelang</span> hasil tangkapan
          Anda? Download aplikasi Perindo Nelayan.
        </p>

        <PlaystoreButton href="https://play.google.com/store/apps/details?id=id.dayagagas.perindo" />
      </div>

      <!-- Right: Perindo Nelayan logo -->
      <div class="flex-1 p-8 pr-0">
        <img src="../assets/perindo-nelayan.png" alt="Perindo Nelayan"
          class="float-right" />
      </div>
    </div>
  </div>
</template>
