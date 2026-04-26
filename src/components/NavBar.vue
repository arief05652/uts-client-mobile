<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="home" href="/home">
                    <ion-icon :icon="home" />
                    <ion-label>Home</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="myLink" href="/myLink">
                    <ion-icon :icon="library" />
                    <ion-label>MyLink</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage,
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonIcon,
} from "@ionic/vue";
import { home, library } from "ionicons/icons";
</script>
