import { run_sampler } from '../_prefabs/prefab_sampler'

// todo:
// - optionally remove background
// - add prompt

app({
    metadata: {
        name: 'zero123-orbit-anything',
        description: 'see anything from any angle; just drop an image, and orbit around it',
    },
    ui: (form) => ({
        orbit: form.orbit({}),
        image: form.image({ default: 'comfy', defaultComfy: { type: 'ComfyImage', imageName: 'example.png' } }),
        sndPass: form.groupOpt({
            items: () => ({
                positive: form.prompt({}),
            }),
        }),
    }),
    run: async (run, ui) => {
        const graph = run.nodes
        const ckpt = graph.ImageOnlyCheckpointLoader({ ckpt_name: 'stable_zero123.ckpt' })
        const startImage2 = await run.loadImageAnswer(ui.image)
        // const upscale_model = graph.Upscale_Model_Loader({ model_name: 'RealESRGAN_x2.pth' })
        const sz123 = graph.StableZero123$_Conditioning({
            width: 256,
            height: 256,
            batch_size: 1,
            elevation: ui.orbit.elevation,
            azimuth: ui.orbit.azimuth,
            clip_vision: ckpt.outputs.CLIP_VISION,
            init_image: startImage2,
            vae: ckpt,
        })
        let latent: _LATENT = graph.KSampler({
            seed: run.randomSeed(),
            steps: 20,
            cfg: 4,
            sampler_name: 'euler',
            scheduler: 'sgm_uniform',
            denoise: 1,
            model: ckpt,
            positive: sz123.outputs.positive,
            negative: sz123.outputs.negative,
            latent_image: sz123,
        })

        // run.add_previewImageWithAlpha(latent)
        graph.SaveImage({ images: graph.VAEDecode({ samples: latent, vae: ckpt }) })
        await run.PROMPT()

        if (!ui.sndPass) return

        if (run.isCurrentDraftAutoStartEnabled() && run.isCurrentDraftDirty()) {
            console.log(`[👙] 1. isCurrentDraftAutoStartEnabled: ${run.isCurrentDraftAutoStartEnabled()}`)
            console.log(`[👙] 1. isCurrentDraftDirty: ${run.isCurrentDraftDirty()}`)
            return
        }

        // Keep gooing if more time available ---------------------------------------------------------
        // if (ui.highResFix) {
        // if (ui.highResFix.saveIntermediaryImage) {
        //     graph.SaveImage({ images: graph.VAEDecode({ samples: latent, vae }) })
        // }
        const ckpt2 = graph.CheckpointLoaderSimple({ ckpt_name: 'revAnimated_v121.safetensors' })
        latent = graph.LatentUpscale({
            samples: latent,
            crop: 'disabled',
            upscale_method: 'nearest-exact',
            height: 512,
            width: 512,
        })
        latent = latent = run_sampler(
            run,
            {
                seed: run.randomSeed(),
                cfg: 4,
                steps: 15,
                denoise: 0.6,
                sampler_name: 'ddim',
                scheduler: 'ddim_uniform',
            },
            {
                latent,
                preview: false,
                ckpt: ckpt2,
                clip: ckpt2,
                vae: ckpt2,
                negative: run.formatEmbeddingForComfyUI('EasyNegative'),
                positive: '3dcg, toy dinosaur, green',
            },
        ).latent

        graph.SaveImage({ images: graph.VAEDecode({ samples: latent, vae: ckpt }) })
        await run.PROMPT()
    },
})
