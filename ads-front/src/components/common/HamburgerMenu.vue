<template>
  <div class="hamburger-menu" :class="{ open: isOpen }" @click="toggleMenu">
    <!-- <span></span>
    <span></span>
    <span></span> -->
    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn color="primary" dark v-bind="props" icon="mdi-menu"> </v-btn>
      </template>

      <v-list>
        <v-list-item>
          <v-list-item-title>
            {{ email }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>
            <SelectAdvertiserModal />
          </v-list-item-title>
        </v-list-item>
        <v-list-item v-for="(item, index) in items" :key="index" @click="goToPage(item.name)">
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
  <v-dialog
    v-model="dialog"
    :scrim="false"
    persistent
    width="auto"
  >
    <v-card
      color="primary"
    >
      <v-card-text>
        Getting campaigns from Tiktok...
        <v-progress-linear
          indeterminate
          color="white"
          class="mb-0"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import * as types from '../../store/types'
import SelectAdvertiserModal from './SelectAdvertiserModal.vue'

const store = useStore()

const isOpen = ref(false)

const email = computed(() => {
  return store.state.auth.user.email
})

const dialog = computed(() => {
  return store.state.campaignGettingFlag
})

const items = ref([
  { title: 'Campaigns', name: 'campaigns' }, 
  { title: 'Add Campaign', name: 'add_campaign' }, 
  { title: 'データを更新する', name: 'get_campagin_from_tiktok' },
  {title: '広告の台本を作る',name: 'chatgpt'},
  { title: 'logout', name: 'logout' }, 
])

function toggleMenu() {
  isOpen.value = !isOpen.value
}

const router = useRouter()
function goToPage(name) {
  if(name == 'campaigns') {
    router.push('/tik/perf')
  } else if(name == 'add_campaign') {
    router.push('/tik/perf/campaign/add')
  } else if(name == 'get_campagin_from_tiktok') {
    store.dispatch(types.GET_CAPAIGN_FROM_TIKTOK)
  } else if(name == 'logout') {
    store.commit('auth/Logout')
    router.push('/login')
  }else if(name == 'chatgpt'){
    router.push('/gpt')
  }
}
</script>

<style>
.hamburger-menu {
  position: absolute;
  right: 5px;
  top: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 50px;
  height: 20px;
  cursor: pointer;
  z-index: 999999;
}

/* .hamburger-menu span {
  display: block;
  width: 100%;
  height: 3px;
  background-color: #333;
  transition: transform 0.3s ease-in-out;
}

.hamburger-menu.open span:first-child {
  transform: translateY(8px) rotate(45deg);
}

.hamburger-menu.open span:nth-child(2) {
  opacity: 0;
}

.hamburger-menu.open span:last-child {
  transform: translateY(-8px) rotate(-45deg);
} */
</style>
