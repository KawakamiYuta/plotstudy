use num_complex::Complex;
use std::f32::consts::PI;
use rand::RngExt;

fn generate_tone(freq: f32, fs: f32, n: usize) -> Vec<Complex<f32>> {
    (0..n)
        .map(|i| {
            let t = i as f32 / fs;
            let phase = 2.0 * PI * freq * t;
            Complex::new(phase.cos(), phase.sin())
        })
        .collect()
}

pub fn generate_pulse_mask(n: usize, pd: usize, pri: usize) -> Vec<f32> {
    let mut mask = vec![0.0; n];

    for i in 0..n {
        if (i % pri) < pd {
            mask[i] = 1.0;
        }
    }

    mask
}

pub fn generate_pulse(
    freq: f32,
    fs: f32,
    n: usize,
    pd: usize,
    pri: usize,
    amplitude: f32
) -> Vec<Complex<f32>> {
    let mut rng = rand::rng();
    let mut out = Vec::with_capacity(n);

    let mut phase = 0.0f32;
    let dphi = 2.0 * PI * freq / fs;

    for i in 0..n {
        let env = if (i % pri) < pd { amplitude } else { 0.0 };

        let sample = Complex::new(phase.cos(), phase.sin()) * env;
        let noise = Complex::new(
               rng.random_range(-1.0..1.0),
               rng.random_range(-1.0..1.0),
        );
        out.push(sample + noise * amplitude * 0.2);

        phase += dphi;
        if phase > 2.0 * PI {
            phase -= 2.0 * PI;
        }
    }

    out
}

fn add_noise(sig: Vec<Complex<f32>>) -> Vec<Complex<f32>> {
    let mut rng = rand::rng();

    sig.into_iter()
        .map(|s| {
            let noise = Complex::new(
                rng.random_range(-1.0..1.0),
                rng.random_range(-1.0..1.0),
            );
            s + noise*0.5
        })
        .collect()
}

pub fn generate_pulse_signal(f: f32, fs: f32, n: usize) -> Vec<f32> {
    let pd = 100;  // pulse duration (samples)
    let pri = 300; // pulse repetition interval (samples)

    let tone = generate_tone(f, fs, n);

    tone.iter()
        .enumerate()
        .map(|(i, e)| {
            let in_pulse = (i % pri) < pd;

            if in_pulse {
                (e.re * e.re + e.im * e.im) * 10.0
            } else {
                0.0
            }
        })
        .collect()
}

pub fn power_db(sig: Vec<Complex<f32>>) -> Vec<f32> {
    sig.iter()
        .map(|s| {
            (s.re*s.re + s.im*s.im) * 1e9
        })
        .map(|p| {
            p.log10()
        })
        .collect()
}