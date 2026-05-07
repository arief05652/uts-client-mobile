<template>
  <ion-page>
    <!-- header -->
    <ion-header class="header">
      <ion-toolbar>
        <ion-icon :icon="arrowBackOutline" slot="start" size="large" style="margin-left: 5px;"
          @click="() => router.back()">
        </ion-icon>
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

      <div v-if="headLink" class="list-head-link">
        <div v-for="item in headLink.link_detail">
          <div class="list-head-data" @click="() => router.push(`/detail/${item.url_id}/${item.cut_link}`)">
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonContent,
  IonPage,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  IonToolbar,
} from "@ionic/vue";
import { link, statsChartOutline, arrowBackOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { Device } from "@capacitor/device";
import ky from "ky";
import { baseUrl } from "@/static";
import { StatusBar, Style } from "@capacitor/status-bar";

const router = useRouter();
const deviceId = ref();

const getDeviceId = async () => {
  deviceId.value = await Device.getId();
};

const headLink = ref();

async function getListLink(limit: number = 100, offset: number = 0) {
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
    style: Style.Dark
  })

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

ion-header {
  text-align: center;
  box-shadow: none;

}

.title-header p {
  color: black;
  text-transform: uppercase;

  font-weight: 700;
  font-size: 18px;
  text-align: center;

}

.title-span-w2 {
  text-transform: capitalize;
  color: purple;

}
</style>
