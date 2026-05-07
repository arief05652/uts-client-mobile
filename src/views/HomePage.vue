<template>
  <ion-page>
    <!-- header -->
    <ion-header class="header">
      <ion-toolbar>
        <div class="title-header">
          <p>Url <span class="title-span-w2">Chunk</span></p>
        </div>
      </ion-toolbar>
    </ion-header>
    <!-- content -->
    <ion-content class="ion-padding-horizontal">
      <ion-refresher slot="fixed" @ionRefresh="refreshListLink($event)">
        <ion-refresher-content pulling-text="Tarik untuk refresh..." refreshing-spinner="circles"
          refreshing-text="Memuat...">
        </ion-refresher-content>
      </ion-refresher>
      <!-- banner -->
      <div class="banner-slogan">
        <p class="title">
          Shorten your link, <br /><span class="share-slogan-p">share</span>
          anywhere
        </p>
        <p class="description">
          Create short links, track performance, <br />
          and boost your productivity.
        </p>
      </div>

      <!-- form shorten url -->
      <div class="box-form-short">
        <ion-input label="Long url" label-placement="floating" class="form" fill="outline" required v-model="urlForm"
          placeholder="Paste your long URL here"></ion-input>

        <ion-input style="margin-top: 10px" class="form" label="Password (optional)" label-placement="floating"
          fill="outline" v-model="passForm" placeholder="Paste your long URL here"></ion-input>

        <ion-button class="submit-chunk" @click="addLink">Shorten URL</ion-button>
      </div>

      <!-- head list my link -->
      <div class="title-my-link">
        <p class="recent-title">Your Links</p>
        <p class="more-link-title" @click="() => router.push('/my_link')">
          View all
        </p>
      </div>

      <!-- list link -->
      <div v-if="headLink" class="list-head-link">
        <div v-for="item in headLink.link_detail">
          <div @click="() => router.push(`/detail/${item.url_id}/${item.cut_link}`)" class="list-head-data">
            <ion-icon :icon="link" class="list-head-icon"></ion-icon>
            <p>https://chunk.my.id/{{ item.cut_link }}</p>
            <div class="list-total-click">
              <ion-icon :icon="statsChartOutline" style="color: black; font-size: 15px"></ion-icon>
              <p>{{ item.total_click }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="else-list-head">
        <p style="font-size: 15px; font-weight: 600">
          Belum memasukan link
        </p>
      </div>

      <ion-toast :is-open="toastUrlForm" message="Url form tidak boleh kosong" :duration="2000"
        @didDismiss="setToastUrlForm(false)">
      </ion-toast>
      <ion-toast :is-open="toastSuccessAdd" message="Berhasil menambahkan link silahkan refresh halaman"
        :duration="2000" @didDismiss="setToastSuccessAdd(false)">
      </ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonInput,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  IonToolbar,
} from "@ionic/vue";
import { link, statsChartOutline } from "ionicons/icons";
import { onIonViewWillEnter } from "@ionic/vue";
import { useRouter } from "vue-router";
import { Device } from "@capacitor/device";
import { onMounted, ref } from "vue";
import ky from "ky";
import { baseUrl } from "@/static";
import { StatusBar, Style } from "@capacitor/status-bar";

const router = useRouter();
const deviceId = ref();
const urlForm = ref();
const passForm = ref();
const resultSentAddLink = ref();

const headLink = ref();

const toastUrlForm = ref(false);
const setToastUrlForm = (state: boolean) => {
  toastUrlForm.value = state;
};

const toastSuccessAdd = ref(false);
const setToastSuccessAdd = (state: boolean) => {
  toastSuccessAdd.value = state;
};

const getDeviceId = async () => {
  deviceId.value = await Device.getId();
};

async function addLink() {
  if (urlForm.value === undefined || urlForm.value === "") {
    toastUrlForm.value = true;
    return;
  } else {
    const result = await ky
      .post(`${baseUrl}/user/add_link`, {
        json: {
          device_id: `${deviceId.value["identifier"]}`,
          original_link: `${urlForm.value}`,
          password: passForm.value || null,
        },
      })
      .json();
    resultSentAddLink.value = result;
    toastSuccessAdd.value = true;
  }
}

async function getListLink(limit: number = 3, offset: number = 0) {
  try {
    const result = await ky
      .get(`${baseUrl}/link/get_user_link/`, {
        searchParams: {
          device_id: `${deviceId.value["identifier"]}`,
          limit: limit,
          offset: offset,
        },
      })
      .json();

    headLink.value = result;
  } catch (error: any) {
    if (error.response?.status === 404) {
      headLink.value = null;
    }
  }
}

const refreshListLink = async (event: RefresherCustomEvent) => {
  try {
    await getListLink();
  } finally {
    event.target.complete();
  }
};

onMounted(async () => {
  await getDeviceId();
  await getListLink();

  await StatusBar.setStyle({
    style: Style.Dark,
  });
});

onIonViewWillEnter(async () => {
  await getDeviceId();
  await getListLink();
});

</script>

<style scoped>
.else-list-head {
  display: flex;
  flex-direction: column;
  height: 20%;
  align-items: center;
  justify-content: center;
}

.list-total-click {
  display: flex;
  flex-direction: row;
  background-color: white;
  width: 30px;
  align-items: center;
  justify-content: space-between;
}

.list-head-icon {
  padding: 15px;
  font-size: 25px;
  background-color: purple;
  border-radius: 10px;
  color: white;
}

/* Parent harus punya tinggi definit */
.list-head-link {
  padding: 20px 20px 20px 20px;
  /* atau min-height, atau biarkan parent yang punya height */

  display: flex;
  /* tambahkan ini */
  flex-direction: column;
  /* susun item secara vertikal */
  gap: 20px;
}

/* Div hasil v-for harus stretch */
.list-head-link>div {
  flex: 1;
  /* bagi tinggi sama rata */
  display: flex;
  min-height: 0;
  /* penting! cegah overflow */
}

/* Baru .list-head-data bisa pakai height 100% */
.list-head-data {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 80px;
  box-shadow: 0px 3px 10px;
  border-radius: 10px;
}

.title-my-link {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.recent-title {
  font-weight: 700;
  font-size: 15px;
}

.more-link-title {
  font-weight: 600;
  color: purple;
}

.submit-chunk {
  width: 100%;
  height: 50px;
  margin-top: 30px;
  --border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.form {
  --border-radius: 12px;
}

.box-form-short {
  padding: 20px;
  margin-top: 35px;
  box-shadow: 0px 5px 10px 3px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
}

ion-header {
  text-align: center;
  box-shadow: none;
}

.title-header p {
  color: black;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 25px;
  text-align: center;
}

.title-span-w2 {
  text-transform: capitalize;
  color: purple;
}

.banner-slogan {
  display: column;
}

.banner-slogan .title {
  font-weight: 600;
  text-align: left;
  font-size: 35px;
  margin-bottom: 5px;
}

.banner-slogan .description {
  color: black;
  font-size: 20px;
  font-weight: 500;
  margin-top: 0px;
  opacity: 0.5;
}

.share-slogan-p {
  color: purple;
}
</style>
