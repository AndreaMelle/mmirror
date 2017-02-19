#ifndef __SENSOR_H__
#define __SENSOR_H__

#include "ISensorListener.h"
#include "SensorTypes.h"
#include <set>
#include <atomic>
#include <uv.h>

namespace Sensing
{
  class Sensor
  {
  public:
    // Not thread safe of course, call from main thread first time,
    // before creating other threads that could access this
    static Sensor& GetInstance()
    {
        static Sensor instance;
        return instance;
    }

    virtual ~Sensor();
    Sensor(Sensor const&) = delete;
    void operator=(Sensor const&) = delete;

    void Start(); // Call from main thread
    void Stop(); // Call from main thread

    void AddListener(ISensorListener* listener, SensorDescr descr);
    void RemoveListener(ISensorListener* listener);

  private:
    Sensor() : m_started(false), m_sharedData(0) {}

    bool m_started;

    uv_thread_t         m_thread; // where sensing loop runs
    uv_async_t          m_async; // signals main thread there's data to consume
    std::atomic<bool>   m_stop; // signals sensing thread to stop

    uv_rwlock_t m_dataLock;
    SensorState m_sharedData;

    std::set<ISensorListener*> m_listeners;

    static void ThreadEntryFn(void* arg);
    static void OnThreadHasData(uv_async_t* handle);

    void ExecuteSensingLoop();
    void HandleData();
  };
}

#endif //__SENSOR_H__
