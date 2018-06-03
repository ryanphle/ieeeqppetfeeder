from PiMotor import Motor
import time

m1 = Motor("MOTOR1",1)
m1.forward(100)
time.sleep(22)
m1.stop()
