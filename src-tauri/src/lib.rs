use tauri::Manager;
use tauri::Emitter;
use rand::Rng;
use rand::RngExt;
// use rand::rngs::thread_rng;

const FRAME_SIZE: usize = 2048;

fn generate_wave() -> Vec<f32> {
    let mut rng = rand::rng();
    let mut buffer = vec![0.0f32; FRAME_SIZE];

    // ベースノイズ
    for v in &mut buffer {
        *v = rng.random_range(-0.02..0.02);
    }

    // パルス生成
    let pulse_count = rng.random_range(1..4);

    for _ in 0..pulse_count {
        let center = rng.random_range(100..FRAME_SIZE - 100);
        let width = rng.random_range(10..80);
        let amplitude = rng.random_range(0.5..1.5);

        for i in 0..FRAME_SIZE {
            let dx = (i as f32 - center as f32) / width as f32;
            let pulse = (-dx * dx * 10.0).exp(); // ガウシアンっぽい
            buffer[i] += amplitude * pulse;
        }
    }

    buffer
}


// #[tauri::command]
fn send_frame(app: &tauri::AppHandle) {
    let samples: Vec<f32> = generate_wave();
    app.emit("wave-frame", samples).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
