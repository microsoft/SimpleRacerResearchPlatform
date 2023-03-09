2022-11-13 bc.onnx: behavioral cloning from driving-data-ex.json, MSE 26.5 on driving-data-ex-2.json, LeNet-style model (note no past actions as inputs)

2022-11-13 bc-with-lag.onnx: off-policy behavioral cloning from bc-with-lag.json, MSE 13.28 on driving-data-ex-2.json, LeNet-style model (note no past actions as inputs)

2022-11-13 bc-with-lag-acts.onnx: off-policy behavioral cloning from bc-with-lag-acts.json, MSE 1.12 on driving-data-w-acts-ex.json, LeNet-style model + past actions at fc1 layer

2022-11-13 bc-with-acts.onnx: behavioral cloning from driving-data-w-acts-ex-2.json, MSE 0.049 on driving-data-w-acts-ex.json, LeNet-style model + past actions at fc1 layer

2022-11-14 bc-with-noise.onnx: off-policy BC from inject-noise.json, MSE 1.02 on driving-data-w-acts-ex.json, only 200 epochs, LeNet-style model + past actions 

2022-11-14 bc-with-noise-2.onnx: off-policy BC from inject-noise.json, longer training (1000-ish epochs), MSE 1.05 on driving-data-w-acts-ex.json, LeNet-style model + past actions; policy gets half a lap in self-driving

2022-11-14 train-on-expert+self: partial-self-policy BC from driving-w-lag-lagassist-noise.json, 900 epochs, MSE 4.18 on driving-data-w-acts-ex.json (one large excursion in scatter plot), LeNet-style model + past actions; policy gets a quarter lap in self-driving

2022-11-14 train-on-expert+self-2: partial-self-policy BC from driving-w-lag-lagassist-noise-2.json (slightly cleaner run), 900 epochs, MSE 2.58 on driving-data-w-acts-ex.json (one smaller excursion), LeNet-style model + past actions; policy gets half a lap in self-driving (behaves quite similarly to bc-with-noise-2)

2022-11-18 train-on-expert+self-augment: partial-self-policy BC from driving-w-lag-lagassist-noise-2.json, data augmentation, 900 epochs, MSE 1.81 on driving-data-w-acts-ex.json, LeNet-style model + past actions; policy can self-drive entire track, but messy (sometimes slows down or goes outside road) and can't succeed with noise=2.0

2022-11-18 mix-noise-w-lagassist-noise: a step toward DAgger, train from driving-w-lag-lagassist-noise-2.json and inject-noise.json, data augmentation, 450 epochs (since dataset size approx. doubled), MSE 0.98 on driving-data-w-acts-ex.json, LeNet-style model + past actions; can self-drive 3/4 of track, but slightly less messy and can handle noise=2.0

2022-11-18 dagger-2: train from inject-noise.json, driving-w-lag-lagassist-noise-2.json, driving-w-lagassist-noise-mixed, data augmentation, 300 epochs (since dataset size approx. tripled), MSE 0.72 on driving-data-w-acts-ex.json, LeNet-style model + past actions; can self-drive entire track pretty cleanly, mostly handles noise=2.0

2022-11-18 dagger-3: train from inject-noise.json, driving-w-lag-lagassist-noise-2.json, driving-w-lagassist-noise-mixed, assist-dagger-2, data augmentation, 300 epochs, MSE 0.92 on driving-data-w-acts-ex.json, LeNet-style model + past actions; can self-drive entire track pretty cleanly, goes several laps with noise=2.0 before getting stuck (though does go onto the grass thru turns sometimes); can't handle noise=5.0; can do a messy job of going backward around most of the track (but without noise, and does get consistently stuck on one turn). Note that this model (and previous ones) were trained and tested with the late-control-injection bug present; this model doesn't work nearly as well after the bug is fixed.

2022-11-28 dagger-4: train from inject-noise.json, driving-w-lag-lagassist-noise-2.json, driving-w-lagassist-noise-mixed, assist-dagger-2, assist-dagger-3, data augmentation, 500 epochs, MSE 1.78; note that only the last iteration is with the late-control-injection bug fixed; doesn't work very well.

2022-11-28 dagger-fix: a step toward DAgger, train from assist-bc-noise-2.json and inject-noise.json, data augmentation, 450 epochs, MSE 1.99; can self-drive about 1/4 of the track at a time

2022-11-28 dagger-fix-2: train from assist-bc-noise-2.json, inject-noise.json, assist-dagger-fix.json, data augmentation, 300 epochs, MSE 0.66; gets stuck in 2 places on track

2022-11-28 dagger-fix-3: train from assist-bc-noise-2.json, inject-noise.json, assist-dagger-fix.json, assist-dagger-fix-2.json, data augmentation, 300 epochs, MSE 0.60; gets stuck about once per lap, with or without noise=2.0, and occasionally drives on grass

2022-11-28 dagger-fix-4: train from assist-bc-noise-2.json, inject-noise.json, assist-dagger-fix.json, assist-dagger-fix-2.json, assist-dagger-fix-3.json; data augmentation, 300 epochs, MSE 0.60; goes off-track about twice per lap, with or without noise=2.0

2022-11-28 dagger-fix-5: train from assist-bc-noise-2.json, inject-noise.json, assist-dagger-fix.json, assist-dagger-fix-2.json, assist-dagger-fix-3.json, assist-dagger-fix-4.json; data augmentation, 300 epochs, MSE 1.01; can self-drive entire course without noise, consistently gets stuck once per lap (at the same place) with noise=2.0

2022-12-9 data-aug.onnx: train from driving-data-w-acts-ex-2.json, 1000 epochs, using data augmentation, MSE 0.03; can drive a little bit but wanders off road pretty quickly

2022-12-9 dart-ish.onnx: train from inject-noise-lag.json, 1000 epochs, using augmentation, MSE 1.00

2022-12-12 sup-edit*.onnx: experiments with editing a model using microlabeling

2023-02-11 random.onnx: a randomly initialized network