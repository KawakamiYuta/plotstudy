//use serde::de;
//use rand::Rng;
#[allow(unused_imports)]
use tauri::Manager;
use rand::RngExt;
//use std::thread;
//use std::time::Duration;
//use std::process::Command;
use ini::Ini;
use std::env;
use tauri::Emitter;

mod signal;
use signal::generate_pulse;
use rustfft::FftPlanner;
const FRAME_SIZE: usize = 2048;

#[allow(dead_code)]
fn generate_gaussian_pulse_train(
    pulse_width: usize,
    pri: usize,
    amplitude: f32,
) -> Vec<f32> {
    let mut buffer = vec![0.0f32; FRAME_SIZE];

    let mut center = 0;

    while center < FRAME_SIZE {
        for i in 0..pulse_width {
            let idx = center + i;
            if idx >= FRAME_SIZE {
                break;
            }

            let x = (i as f32 - pulse_width as f32 / 2.0)
                / (pulse_width as f32 / 4.0);

            let pulse = (-x * x).exp();
            buffer[idx] += amplitude * pulse;
        }

        center += pri;
    }

    buffer
}

#[allow(dead_code)]
fn add_noise(buffer: &mut [f32], level: f32) {
    let mut rng = rand::rng();

    for v in buffer {
        *v += rng.random_range(-level..level);
    }
}


#[allow(dead_code)]
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

#[allow(dead_code)]
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

#[derive(serde::Serialize, Clone, serde::Deserialize)]
struct Range {
    start: usize,
    end: usize,
}

#[derive(serde::Serialize, Clone, serde::Deserialize)]
struct FrameData {
    frame_number: u64,
    samples: Vec<f32>,
    spectrum: Vec<f32>,

    // optional metadata that accompanies a frame
    threshold: i32,
    highlight_range: Option<Range>,
    analysis_bins: Vec<usize>,
}

// helper to pull the current threshold/highlight/bins from the INI file
fn load_frame_meta() -> Result<(i32, Option<Range>, Vec<usize>), String> {
    let ini_path = "config.ini";
    let conf = Ini::load_from_file(ini_path)
        .map_err(|e| format!("Failed to read ini: {}", e))?;

    let get_val = |section: &str, key: &str| {
        conf.section(Some(section))
            .and_then(|sec| sec.get(key))
            .map(|s| s.to_string())
    };

    let threshold = get_val("Execution", "threshold")
        .and_then(|s| s.parse::<i32>().ok())
        .unwrap_or(0);

    // optional highlight range
    let start = get_val("Analysis", "highlight_start")
        .and_then(|s| s.parse::<usize>().ok());
    let end = get_val("Analysis", "highlight_end")
        .and_then(|s| s.parse::<usize>().ok());
    let highlight = start.and_then(|s| end.map(|e| (s, e)));

    let bins_str = get_val("Analysis", "bins").unwrap_or_default();
    let bins: Vec<usize> = bins_str
        .split(',')
        .filter_map(|s| s.trim().parse::<usize>().ok())
        .collect();

    Ok((threshold, highlight.map(|(s, e)| Range { start: s, end: e }), bins))
}

fn convert_disp(power: &mut [f32]) {
    let max = power
        .iter()
        .copied()
        .fold(0.0_f32, f32::max);

    if max > 0.0 {
        let inv_max = 1.0 / max;
        for v in power {
            *v *= inv_max;
        }
    }
}

fn send_frame(app: &tauri::AppHandle) {
    let mut planner = FftPlanner::<f32>::new();
    let fft = planner.plan_fft_forward(FRAME_SIZE);
    // let mut wave = generate_gaussian_pulse_train(50, 200, 100.);
    // add_noise(wave.as_mut_slice(), 0.5);

    // let pulse = generate_pulse_signal(200.0, 1000., FRAME_SIZE);
    let mut pulse_iq = generate_pulse(200., 1000., FRAME_SIZE, 500, 1000, 1000.);
    let mut power: Vec<f32> = pulse_iq.iter().map(|e| e.norm_sqr()).collect();
    convert_disp(&mut power);
    fft.process(&mut pulse_iq);
    let mut spectrum: Vec<f32> = pulse_iq.iter().map(|e| 10.*e.norm_sqr().log10()).collect();
    // convert_disp(&mut spectrum);
    // pull threshold/highlight/bins from configuration each frame
    let (threshold, highlight_range, analysis_bins) =
        load_frame_meta().unwrap_or((0, None, Vec::new()));

    let frame = FrameData {
        frame_number: 0,
        samples: power.to_vec(),
        spectrum: spectrum,
        threshold,
        highlight_range,
        analysis_bins,
    };
    // use emit_all which is available on AppHandle to broadcast the event
    app.emit("wave-frame", frame).unwrap();
}

#[tauri::command]
fn pull_frame(app: tauri::AppHandle) {
    send_frame(&app);
}

#[derive(serde::Deserialize)]
struct CommandParams {
       threshold: i32,
}


// #[tauri::command]
// fn run_external_command(params: CommandParams) {
//     println!("Threshold: {}", params.threshold);

//     std::process::Command::new("your_binary")
//         .arg(params.threshold.to_string())
//         .spawn()
//         .expect("failed to execute");
// }
#[tauri::command]
fn run_external_command(params: CommandParams) -> Result<(), String> {


    let cwd = env::current_dir().unwrap();
        println!("cwd: {} Threshold: {}", cwd.display(), params.threshold);
    let ini_path = "config.ini";

    // ini読み込み
    let mut conf = Ini::load_from_file(ini_path)
        .map_err(|e| format!("Failed to read ini: {}", e))?;

    // セクション名は適宜変更
    conf.with_section(Some("Execution"))
        .set("threshold", params.threshold.to_string());

    // 保存
    conf.write_to_file(ini_path)
        .map_err(|e| format!("Failed to write ini: {}", e))?;

    // // 外部コマンド実行
    // Command::new("your_binary")
    //     .spawn()
    //     .map_err(|e| format!("Failed to execute: {}", e))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let _app_handle = app.handle().clone();

            // thread::spawn(move || {
            //     loop {
            //         send_frame(&app_handle);
            //         thread::sleep(Duration::from_millis(100));
            //     }
            // });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            pull_frame,
            run_external_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
