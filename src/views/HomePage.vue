<template>
    <ion-page>
        <!-- header -->
        <ion-header class="header">
            <div class="title-header">
                <p>Url <span class="title-span-w2">Chunk</span></p>
            </div>
        </ion-header>
        <!-- content -->
        <ion-content class="ion-padding-horizontal">
            <!-- banner -->
            <div class="banner-slogan">
                <p class="title">
                    Shorten your link, <br /><span class="share-slogan-p"
                        >share</span
                    >
                    anywhere
                </p>
                <p class="description">
                    Create short links, track performance, <br />
                    and boost your productivity.
                </p>
            </div>

            <!-- form shorten url -->
            <div class="box-form-short">
                <ion-input
                    label="Long url"
                    label-placement="floating"
                    class="form"
                    fill="outline"
                    placeholder="Paste your long URL here"
                ></ion-input>

                <ion-input
                    style="margin-top: 10px"
                    class="form"
                    label="Password (optional)"
                    label-placement="floating"
                    fill="outline"
                    placeholder="Paste your long URL here"
                ></ion-input>

                <ion-button class="submit-chunk">Shorten URL</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonHeader,
    IonContent,
    IonPage,
    IonButton,
    IonInput,
} from "@ionic/vue";
</script>

<style scoped>
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
    font-size: 18px;
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
    font-size: 25px;
    margin-bottom: 5px;
}

.banner-slogan .description {
    color: black;
    font-size: 15px;
    font-weight: 500;
    margin-top: 0px;
    opacity: 0.5;
}

.share-slogan-p {
    color: purple;
}
</style>
