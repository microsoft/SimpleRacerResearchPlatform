
2022-11-11 driving-data-ex.json: short run, expert control, clockwise

2022-11-12 driving-data-ex-2.json: short run, expert control, clockwise

2022-11-13: bc-with-lag.json: expert control but with lag, clockwise -- didn't record executed actions, only expert

2022-11-13: bc-with-lag-acts.json: expert control but with lag, clockwise -- recorded both actual and expert actions

2022-11-13: driving-data-w-acts-ex.json: expert control without lag, clockwise -- recorded both actual and expert actions
2022-11-13: driving-data-w-acts-ex-2.json: same

2022-11-14: inject-noise.json: expert control with added noise, strength 7, a bit over a lap clockwise

2022-11-14: driving-w-lag-lagassist-noise.json: expert control w/ lag-assist from bc-with-noise-2.onnx, lag every 1.0s for 600ms, noise level 2; expert gets stuck briefly at one point

2022-11-14: driving-w-lag-lagassist-noise-2.json: expert control w/ lag-assist from bc-with-noise-2.onnx, lag every 1.0s for 600ms, noise level 2; somewhat cleaner run

2022-11-16: driving-w-lagassist-noise-mixed.json: expert control w/ lag-assist from mix-noise-w-lagassist-noise.onnx, lag every 1.0s for 600ms, noise level 2; tried 3 times and got a fairly clean run

2022-11-16: assist-dagger-2.json: expert control w/ lag-assist from dagger-2.onnx, lag every 1.0s for 600ms, noise level 2

2022-11-20: self-drive.json: example of self driving, noise level 2, using model dagger-3.onnx

*** Above here, a bug meant that the network's predictions were applied one frame too late. This affects both self driving and lag assist. ***

2022-11-28: self-drive-2.json: example of self driving, noise level 2, using model dagger-3.onnx; fixed bug in previous recording (so that predictions are applied at the correct frame); this recording is noticeably wobblier, presumably because DAgger training wasn't actually on our own distribution of states due to the just-fixed bug

2022-11-28: assist-dagger-3.json: expert control w/ lag-assist from dagger-3.onnx, lag every 1.0s for 600ms, noise level 2

2022-11-28: assist-bc-noise-2.json: expert control w/ lag-assist from bc-with-noise-2.onnx, lag every 1.0s for 600ms, noise level 2 (just like driving-w-lag-lagassist-noise-2.json but with fix for late control injection bug)

2022-11-28: assist-dagger-fix.json: expert control w/ lag-assist from dagger-fix.onnx, lag every 1.0s for 300ms (not 600ms, it was too hard for the expert to drive that way), noise level 2

2022-11-28: assist-dagger-fix-2.json: expert control w/ lag-assist from dagger-fix-2.onnx, lag every 1.0s for 600ms, noise level 2; had to try a few times to get a clean run

2022-11-29: assist-dagger-fix-3.json: expert control w/ lag-assist from dagger-fix-3.onnx, lag every 1.0s for 600ms, noise level 2; second try, not sure whether error in first run was due to me or to model

2022-11-29: assist-dagger-fix-4.json: expert control w/ lag-assist from dagger-fix-4.onnx, lag every 1.0s for 600ms, noise level 2; contains some significant off-road from model's mistakes, but expert corrects

2022-11-29: hires.json.gz, hires-offroad.json.gz: expert control, following road or going offroad respectively, no noise or lag, recorded at higher resolution (128*128)

2022-12-9: inject-noise-lag.json: expert control with added noise (strength 5) and lag (300ms every 1.0s)

2022-12-10: self-drive-3.json: self driving, noise 0, using model dagger-fix-5.onnx

*** Above here, all data collected on original map, no gates ***

2023-02-11: random.json.gz: data collected with a random policy (random.onnx plus inject noise of scale 15.0), map Matane with random starting positions and backgrounds, hit New Game manually every few seconds to get variety of states