<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-icon size="large" slot="start" :icon="arrowBackOutline" @click="route.back()"
          style="margin-left: 5px;"></ion-icon>
        <p class="title-header">Analytics</p>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="header-link">
        <div class="title-icon-link">
          <ion-icon :icon="link" class="link-icon"></ion-icon>
          <p>{{ url }}</p>
        </div>
        <ion-icon :icon="clipboardOutline" class="link-clip" @click="writeToClipboard"></ion-icon>
      </div>

      <div class="stats">
        <canvas ref="chart"> </canvas>
      </div>

      <div class="operation-link">
        <div id="open-modal">Update Password</div>
        <div @click="showDeleteDialog">Delete Link</div>
        <div @click="dlQr">Generate QrCode</div>
      </div>

      <ion-modal ref="resetModal" trigger="open-modal" @willDismiss="onWillDismiss">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="cancel()">Cancel</ion-button>
            </ion-buttons>
            <ion-title>Update Password</ion-title>
            <ion-buttons slot="end">
              <ion-button :strong="true" @click="confirm()">Confirm</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-item>
            <ion-input label="Masukan password baru" label-placement="stacked" ref="input" type="text"></ion-input>
          </ion-item>

          <ion-toast :is-open="validateNewPassword" message="Password tidak boleh kosong" :duration="2000"
            @didDismiss="setValidateNewPassword(false)">
          </ion-toast>

        </ion-content>
      </ion-modal>


      <ion-toast :is-open="isCopyActive" message="Link sudah di copy." :duration="2000"
        @didDismiss="setCopyActive(false)">
      </ion-toast>

      <ion-toast :is-open="isDownload" message="Qr berhasil di download." :duration="2000"
        @didDismiss="setIsDownload(false)">
      </ion-toast>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonIcon, IonContent, IonToast, IonButtons,
  IonModal, IonTitle, IonInput, IonItem, IonButton,
} from '@ionic/vue'
import ky from "ky";
import { onMounted } from 'vue';
import { OverlayEventDetail } from '@ionic/core/components';
import { arrowBackOutline, link, clipboardOutline } from 'ionicons/icons';
import { Clipboard } from '@capacitor/clipboard';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { baseUrl } from '@/static';
import { Chart } from 'chart.js/auto';
import { Dialog } from '@capacitor/dialog';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { StatusBar, Style } from '@capacitor/status-bar';

const resetModal = ref();
const input = ref();

const validateNewPassword = ref(false);
const setValidateNewPassword = (state: boolean) => {
  validateNewPassword.value = state;
}

const isDownload = ref(false);
const setIsDownload = (state: boolean) => {
  isDownload.value = state;
}

const route = useRouter();
const routeParam = useRoute();

const param = routeParam.params;

const detailLink = ref();
const url = ref(`https://chunk.my.id/${param.cut_url}`);

const isCopyActive = ref(false);
const setCopyActive = (state: boolean) => {
  isCopyActive.value = state;

}

const chart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart<any, any, any> | null = null;

function groupByUserAgent(data: any[]) {
  const result: Record<string, number> = {}

  data.forEach(item => {
    const ua = item.user_agent || "Unknown"

    if (!result[ua]) {
      result[ua] = 0
    }

    result[ua]++
  })

  return {
    labels: Object.keys(result),
    values: Object.values(result)
  }
}

interface LinkData {
  timestamp: string
  count_id: string
  url_id: string
  user_agent: string
}

interface ApiResponse {
  total: number
  limit: number
  offset: number
  data: LinkData[]
}

async function getDetailLink() {
  try {
    const result = await ky.get(`${baseUrl}/link/get_link_detail`, {
      searchParams: {
        url_id: param.link_id.toString(),
        limit: 100,
        offset: 0,
      }
    }).json<ApiResponse>();

    detailLink.value = result;

    const grouped = groupByUserAgent(result.data)

    // update chart
    if (chartInstance) {
      chartInstance.data.labels = grouped.labels
      chartInstance.data.datasets[0].data = grouped.values
      chartInstance.update()
    }

    return grouped

  } catch (error: any) {
    console.log("error: ", error)
  }
}

const writeToClipboard = async () => {
  await Clipboard.write({
    string: url.value
  });
  isCopyActive.value = true;
};

const onWillDismiss = (event: CustomEvent<OverlayEventDetail>) => {
  if (event.detail.role === 'confirm') {
  }
};


const cancel = () => resetModal.value.$el.dismiss(null, 'cancel');

const confirm = async () => {
  const name = input.value.$el.value;

  if (name === '') {
    validateNewPassword.value = true;
  } else {
    try {
      await ky.patch(`${baseUrl}/link/update_link/${param.link_id}/`, {
        searchParams: {
          new_pass: name.toString(),
        }
      })

      resetModal.value.$el.dismiss(name, 'confirm');
    } catch (error: any) {
      console.log(error)
    }
  }
};


const showDeleteDialog = async () => {
  const { value } = await Dialog.confirm({
    title: 'Delete Link',
    message: 'Kamu yakin ingin menghapus link ini?',
  });

  if (value == true) {
    try {
      await ky.delete(`${baseUrl}/link/delete_link`, {
        searchParams: {
          url_id: param.link_id.toString(),
        }
      })
      route.replace('/my_link');
    } catch (error: any) {
      console.log(error)
    }
  }
};

const dlQr = async () => {
  await Filesystem.downloadFile({
    url: `${baseUrl}/link/gen_qr?url_id=${param.link_id}`,
    path: `url_chunk_${Date.now()}.png`,
    directory: Directory.Documents,
  });

  isDownload.value = true;
};

onMounted(async () => {
  const grouped = await getDetailLink();

  if (!chart.value) return

  const ctx = chart.value.getContext('2d')
  if (!ctx) return

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: grouped?.labels,
      datasets: [{
        label: 'Browser click',
        data: grouped?.values,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  await StatusBar.setStyle({
    style: Style.Dark
  });
});
</script>

<style scoped>
.operation-link {
  border-radius: 15px;
  box-shadow: 0 0 10px 0;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 25px;
}

.operation-link>div {
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 5px 0;
}

.stats {
  margin-top: 20px;
}

.stats-link {
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: space-around;
}

.link-clip {
  margin-right: 10px;
  font-size: 20px;
}

.link-icon {
  margin-right: 15px;
  background-color: purple;
  border-radius: 10px;
  font-size: 25px;
  padding: 12px;
  color: white;
}

.title-icon-link {
  display: inline-flex;
  align-items: center;
  padding: 5px;
}

.header-link {
  display: flex;
  box-shadow: 0 0 10px 0;
  border-radius: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
}

ion-header {
  box-shadow: none;
  text-align: center;
}

.title-header {
  color: black;
  text-transform: capitalize;
  font-weight: 700;
  font-size: 18px;
  text-align: center;
}
</style>
