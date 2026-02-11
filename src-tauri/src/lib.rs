use serde::de;
use tauri::{Emitter, Manager};
use rand::Rng;
use rand::RngExt;
use std::thread;
use std::time::Duration;

const FRAME_SIZE: usize = 2048;

fn generate_wave() -> Vec<f32> {
    let mut rng = rand::rng();
    let mut buffer = vec![0.0f32; FRAME_SIZE];

    for v in &mut buffer {
        *v = rng.random_range(-0.02..0.02);
    }

    let pulse_count = rng.random_range(1..4);

    for _ in 0..pulse_count {
        let center = rng.random_range(100..FRAME_SIZE - 100);
        let width = rng.random_range(10..80);
        let amplitude = rng.random_range(0..256) as f32;

        for i in 0..FRAME_SIZE {
            let dx = (i as f32 - center as f32) / width as f32;
            let pulse = (-dx * dx * 10.0).exp();
            buffer[i] += amplitude * pulse;
        }
    }

    buffer
}

fn generate_spectrum() -> Vec<f32> {
    let mut rng = rand::rng();
    let len = FRAME_SIZE / 2;

    let peak_pos = rng.random_range(0..len);
    let peak_width = 20;

    let mut spectrum = vec![0.0; len];

    for i in 0..len {
        let noise: f32 = rng.random_range(0.0..20.0);

        // ガウスっぽいピーク
        let distance = (i as i32 - peak_pos as i32).abs() as f32;
        let peak = (-(distance * distance) / (2.0 * peak_width as f32)).exp() * 256.0;

        spectrum[i] = (peak + noise).min(256.0);
    }

    spectrum
}

#[derive(serde::Serialize, Clone)]
struct FrameData {
    frame_number: u64,
    samples: Vec<f32>,
    spectrum: Vec<f32>,
}

fn send_frame(app: &tauri::AppHandle) {
    let frame = FrameData {
        frame_number: 0,
        samples: generate_wave(),
        spectrum: generate_spectrum(),
    };
    app.emit("wave-frame", frame).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();

            thread::spawn(move || {
                loop {
                    send_frame(&app_handle);
                    thread::sleep(Duration::from_millis(100));
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
