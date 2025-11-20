use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};
use netok_core::{detect_dns_provider, get_computer_info, get_default_settings, run_diagnostics};

fn benchmark_full_diagnostics(c: &mut Criterion) {
    let settings = get_default_settings();

    c.bench_function("run_diagnostics", |b| {
        b.iter(|| {
            let snapshot = run_diagnostics(black_box(&settings));
            black_box(snapshot);
        })
    });
}

fn benchmark_computer_info(c: &mut Criterion) {
    c.bench_function("get_computer_info", |b| {
        b.iter(|| {
            let info = get_computer_info();
            black_box(info);
        })
    });
}

fn benchmark_dns_detection(c: &mut Criterion) {
    let test_cases = vec![
        (
            "cloudflare",
            vec!["1.1.1.1".to_string(), "1.0.0.1".to_string()],
        ),
        ("google", vec!["8.8.8.8".to_string(), "8.8.4.4".to_string()]),
        ("custom", vec!["1.2.3.4".to_string(), "5.6.7.8".to_string()]),
        ("single", vec!["1.1.1.1".to_string()]),
        ("empty", vec![]),
    ];

    let mut group = c.benchmark_group("dns_detection");

    for (name, servers) in test_cases {
        group.bench_with_input(BenchmarkId::from_parameter(name), &servers, |b, servers| {
            b.iter(|| {
                let provider = detect_dns_provider(black_box(servers));
                black_box(provider);
            })
        });
    }

    group.finish();
}

fn benchmark_settings(c: &mut Criterion) {
    c.bench_function("get_default_settings", |b| {
        b.iter(|| {
            let settings = get_default_settings();
            black_box(settings);
        })
    });
}

criterion_group!(
    benches,
    benchmark_full_diagnostics,
    benchmark_computer_info,
    benchmark_dns_detection,
    benchmark_settings
);
criterion_main!(benches);
