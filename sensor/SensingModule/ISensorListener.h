#ifndef __I_SENSOR_LISTENER_H__
#define __I_SENSOR_LISTENER_H__

#include "SensorTypes.h"

namespace Sensing
{
  class ISensorListener
  {
  public:
    virtual void OnStateChange(SensorState state) const = 0;
  };
}

#endif //__SENSOR_LISTENER_H__
